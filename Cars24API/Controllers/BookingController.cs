using Microsoft.AspNetCore.Mvc;
using Cars24API.Models;
using Cars24API.Services;


namespace Cars24API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly BookingService _bookingService;
        private readonly UserService _userService;
        private readonly CarService _carService;
        private readonly NotificationService _notificationService;
        private readonly ReferralService _referralService;
        public class bookingDto
        {
            public required Booking Booking { get; set; }
            public Car? Car { get; set; }
        }
        public BookingController(BookingService bookingService, UserService userService, CarService carService, NotificationService notificationService, ReferralService referralService)
        {
            _bookingService = bookingService;
            _userService = userService;
            _carService = carService;
            _notificationService = notificationService;
            _referralService = referralService;
        }
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromQuery] string userId, [FromBody] Booking booking)
        {
            if (booking == null || string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(booking.CarId))
                return BadRequest("Userid and carid is not present");

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");
            user.BookingId ??= new List<string>();

            booking.LoanStatus = string.Equals(booking.LoanRequired, "yes", StringComparison.OrdinalIgnoreCase)
                ? "In Process"
                : "Not Required";

            await _bookingService.CreateAsync(booking);

            user.BookingId.Add(booking.Id!);
            await _userService.UpdateAsync(user.Id, user);

            var car = await _carService.GetByIdAsync(booking.CarId);
            await _notificationService.SendToUserAsync(
                user,
                "Booking Confirmed",
                $"Your booking for {car?.Title ?? "your car"} has been confirmed.",
                NotificationService.NotificationCategory.AppointmentAndBookingUpdates);

            try
            {
                await _referralService.TryGrantRewardAsync(user);
            }
            catch
            {
                // swallowed - non-critical to the booking itself
            }

            return CreatedAtAction(nameof(GetbookingById), new { id = booking.Id }, booking);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetbookingById(string id)
        {
            var booking = await _bookingService.GetByIdAsynch(id);
            if (booking == null)
                return NotFound();
            return Ok(booking);
        }
        [HttpGet("user/{userId}/bookings")]
        public async Task<IActionResult> GetbookingByUserId(string userId)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound();
            user.BookingId ??= new List<string>(); 
            var results = new List<bookingDto>();
            foreach (var bookingid in user.BookingId)
            {
                var booking = await _bookingService.GetByIdAsynch(bookingid);
                if (booking != null)
                {
                    var car = await _carService.GetByIdAsync(booking.CarId);
                    results.Add(new bookingDto
                    {
                        Booking = booking,
                        Car = car
                    });
                }
            }
            return Ok(results);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(string id, [FromBody] Booking booking)
        {
            if (booking == null)
                return BadRequest("Booking data is required");

            var existing = await _bookingService.GetByIdAsynch(id);
            if (existing == null)
                return NotFound("Booking not found");

            booking.Id = id; 
            var updated = await _bookingService.UpdateAsync(id, booking);
            if (!updated)
                return NotFound("Booking not found");

            return Ok(booking);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(string id, [FromQuery] string? userId)
        {
            var existing = await _bookingService.GetByIdAsynch(id);
            if (existing == null)
                return NotFound("Booking not found");

            await _bookingService.DeleteAsync(id);

            if (!string.IsNullOrEmpty(userId))
            {
                var user = await _userService.GetByIdAsync(userId);
                if (user != null && (user.BookingId?.Remove(id) ?? false))
                {
                    await _userService.UpdateAsync(user.Id, user);
                }
            }

            return NoContent();
        }
    }
}