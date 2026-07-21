using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System;

namespace Cars24API.Models
{
    public class Booking
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }  // Booking ID

        [Required]
        public string CarId { get; set; } = null!;  // Reference to Car by Id

        [Required]
        public string Name { get; set; } = null!;  // Customer's name

        [Required]
        [Phone]
        public string Phone { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Address { get; set; } = null!;

        [Required]
        public string PreferredDate { get; set; } = null!;

        [Required]
        public string PreferredTime { get; set; } = null!;

        [Required]
        public string PaymentMethod { get; set; } = null!;

        public string LoanRequired { get; set; } = "no";
        public string DownPayment { get; set; } = string.Empty;
        public string LoanStatus { get; set; } = string.Empty; // Set by server: "Not Required" | "In Process" | "Approved"
    }
}
