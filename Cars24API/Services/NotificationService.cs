using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Cars24API.Models;

namespace Cars24API.Services
{
    public class NotificationService
    {
        private readonly ILogger<NotificationService> _logger;
        private readonly UserService _userService;
        private readonly bool _isConfigured;

        private const string LocalServiceAccountFileName = "firebase-service-account.json";

        public enum NotificationCategory
        {
            AppointmentAndBookingUpdates,
            BidUpdates,
            PriceDrops,
            NewMessages
        }

        public NotificationService(ILogger<NotificationService> logger, UserService userService)
        {
            _logger = logger;
            _userService = userService;

            var serviceAccountJson = Environment.GetEnvironmentVariable("FIREBASE_SERVICE_ACCOUNT_JSON");

            if (string.IsNullOrWhiteSpace(serviceAccountJson))
            {
                var localPath = Path.Combine(Directory.GetCurrentDirectory(), LocalServiceAccountFileName);
                if (File.Exists(localPath))
                {
                    serviceAccountJson = File.ReadAllText(localPath);
                }
            }

            if (string.IsNullOrWhiteSpace(serviceAccountJson))
            {
                _isConfigured = false;
                _logger.LogWarning(
                    "No Firebase credentials found (checked FIREBASE_SERVICE_ACCOUNT_JSON env var and " +
                    "./{FileName}) - push notifications are disabled.", LocalServiceAccountFileName);
                return;
            }

            try
            {
                if (FirebaseApp.DefaultInstance == null)
                {
                    FirebaseApp.Create(new AppOptions
                    {
                        Credential = GoogleCredential.FromJson(serviceAccountJson)
                    });
                }
                _isConfigured = true;
            }
            catch (Exception ex)
            {
                _isConfigured = false;
                _logger.LogError(ex, "Failed to initialize Firebase Admin SDK - push notifications are disabled.");
            }
        }

        public bool IsConfigured => _isConfigured;

        public async Task SendToUserAsync(User user, string title, string body, NotificationCategory category)
        {
            if (!_isConfigured) return;
            if (user.FcmTokens is not { Count: > 0 }) return;
            if (!IsCategoryEnabled(user.NotificationPreferences, category)) return;

            var staleTokens = new List<string>();

            foreach (var token in user.FcmTokens)
            {
                try
                {
                    var message = new Message
                    {
                        Token = token,
                        Notification = new FirebaseAdmin.Messaging.Notification
                        {
                            Title = title,
                            Body = body
                        }
                    };
                    await FirebaseMessaging.DefaultInstance.SendAsync(message);
                }
                catch (FirebaseMessagingException ex) when (
                    ex.MessagingErrorCode == MessagingErrorCode.Unregistered ||
                    ex.MessagingErrorCode == MessagingErrorCode.InvalidArgument)
                {
                    staleTokens.Add(token);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send push notification to a device for user {UserId}", user.Id);
                }
            }

            if (staleTokens.Count > 0)
            {
                foreach (var token in staleTokens)
                {
                    user.FcmTokens.Remove(token);
                }
                await _userService.UpdateAsync(user.Id, user);
            }
        }

        private static bool IsCategoryEnabled(NotificationPreferences? prefs, NotificationCategory category)
        {
            prefs ??= new NotificationPreferences();

            return category switch
            {
                NotificationCategory.AppointmentAndBookingUpdates => prefs.AppointmentAndBookingUpdates,
                NotificationCategory.BidUpdates => prefs.BidUpdates,
                NotificationCategory.PriceDrops => prefs.PriceDrops,
                NotificationCategory.NewMessages => prefs.NewMessages,
                _ => true
            };
        }
    }
}
