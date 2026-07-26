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
}