using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24API.Models
{
    public class Appointment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        
        public string? CarId { get; set; }

        public string ScheduledDate { get; set; } = string.Empty;
        public string ScheduledTime { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string AppointmentType { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;
    }
}