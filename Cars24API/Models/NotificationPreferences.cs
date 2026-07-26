namespace Cars24API.Models
{
    // "AppointmentAndBookingUpdates" is the only category with a real event
    // wired up today (see BookingController/AppointmentController). Bidding
    // and in-app messaging don't exist anywhere else in Cars24 yet, so
    // BidUpdates/NewMessages are stored and returned for a future feature to
    // read, but nothing sends against them currently - see NotificationService.
    public class NotificationPreferences
    {
        public bool AppointmentAndBookingUpdates { get; set; } = true;
        public bool BidUpdates { get; set; } = true;
        public bool PriceDrops { get; set; } = true;
        public bool NewMessages { get; set; } = true;
    }
}