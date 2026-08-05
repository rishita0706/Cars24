namespace Cars24API.Models
{
    public class NotificationPreferences
    {
        public bool AppointmentAndBookingUpdates { get; set; } = true;
        public bool BidUpdates { get; set; } = true;
        public bool PriceDrops { get; set; } = true;
        public bool NewMessages { get; set; } = true;
    }
}