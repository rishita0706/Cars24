using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Cars24API.Models
{
    public class Appointment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string? CarId { get; set; }

        [Required]
        public string ScheduledDate { get; set; } = string.Empty;

        [Required]
        public string ScheduledTime { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = string.Empty;

        public string AppointmentType { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;
    }
}
