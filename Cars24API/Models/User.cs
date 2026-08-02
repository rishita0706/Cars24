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

    // One browser/device can register more than one token over time (e.g. a
    // user visiting from phone + laptop) - a push goes to every token on file.
    public List<string> FcmTokens { get; set; } = new List<string>();
    public NotificationPreferences NotificationPreferences { get; set; } = new NotificationPreferences();

    // Referral program. ReferralCode is this user's own shareable code
    // (server-generated at signup, never trusted from client input).
    // ReferredByCode/ReferredByUserId are set once, at signup, from whatever
    // code they signed up with - a code can't be "applied" after the fact.
    public string? ReferralCode { get; set; }
    public string? ReferredByCode { get; set; }
    public string? ReferredByUserId { get; set; }

    // Flips to true the first time this user's referral reward is granted
    // (on their first completed booking or car listing) - prevents a second
    // booking/listing from paying out the referral bonus again.
    public bool ReferralRewardGranted { get; set; } = false;

    public int WalletBalance { get; set; } = 0;
}