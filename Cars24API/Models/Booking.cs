using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace Cars24API.Models
{
    public class Booking
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }  // Booking ID
        public string CarId { get; set; } = null!;  // Reference to Car by Id
        public string Name { get; set; } = null!;  // Customer's name
        public string Phone { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string PreferredDate { get; set; } = null!;
        public string PreferredTime { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;
        public string LoanRequired { get; set; } = null!;
        public string DownPayment { get; set; } = null!;
        public string LoanStatus { get; set; } = string.Empty; // Set by server: "Not Required" | "In Process" | "Approved"
    }
}