using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24API.Models
{
    public class WalletTransaction
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        // "Earned" | "Redeemed"
        public string Type { get; set; } = string.Empty;

        // Positive for Earned, negative for Redeemed - a running balance is
        // just the sum of this field if it's ever needed independent of
        // User.WalletBalance.
        public int Points { get; set; }

        public string Reason { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
