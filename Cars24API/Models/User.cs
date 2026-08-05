using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Cars24API.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;

    public List<string> BookingId { get; set; } = new List<string>();
    public List<string> AppointmentId { get; set; } = new List<string>();

    public List<string> FcmTokens { get; set; } = new List<string>();
    public NotificationPreferences NotificationPreferences { get; set; } = new NotificationPreferences();

    public string? ReferralCode { get; set; }
    public string? ReferredByCode { get; set; }
    public string? ReferredByUserId { get; set; }

    public bool ReferralRewardGranted { get; set; } = false;

    public int WalletBalance { get; set; } = 0;

    public string? PasswordResetTokenHash { get; set; }
    public DateTime? PasswordResetExpiresAt { get; set; }
}