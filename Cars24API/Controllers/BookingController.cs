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
        public class bookingDto
        {
            public required Booking Booking { get; set; }
            public Car? Car { get; set; }
        }
        public BookingController(BookingService bookingService, UserService userService, CarService carService)
        {
            _bookingService = bookingService;
            _userService = userService;
            _carService = carService;
        }
        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromQuery] string userId, [FromBody] Booking booking)
        {
            if (booking == null || string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(booking.CarId))
                return BadRequest("Userid and carid is not present");

            await _bookingService.CreateAsync(booking);
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");
            if (user.BookingId == null)
            {
                user.BookingId = new List<string>();
            }
            user.BookingId.Add(booking.Id);
            await _userService.UpdateAsync(user.Id, user);
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
    }
}