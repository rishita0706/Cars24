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
                _isConfigured = false;
                _logger.LogWarning(
                    "FIREBASE_SERVICE_ACCOUNT_JSON is not set - push notifications are disabled.");
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

        // Best-effort: never throws. A push-delivery failure should never
        // break the booking/appointment/etc. flow that triggered it - callers
        // don't need their own try/catch around this.
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
                    // Token is dead (browser data cleared, permission revoked, app
                    // uninstalled, etc.) - stop trying to send to it.
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