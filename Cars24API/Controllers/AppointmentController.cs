using Microsoft.AspNetCore.Mvc;
using Cars24API.Models;
using Cars24API.Services;


namespace Cars24API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentController : ControllerBase
    {
        private readonly AppointmentService _appointmentService;
        private readonly UserService _userService;
        private readonly CarService _carService;
        public class AppointmentDto
        {
            public required Appointment Appointment { get; set; }
            public Car? Car { get; set; }
        }
        public AppointmentController(AppointmentService appointmentService, UserService userService, CarService carService)
        {
            _appointmentService = appointmentService;
            _userService = userService;
            _carService = carService;
        }
        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromQuery] string userId, [FromBody] Appointment appointment)
        {
            if (appointment == null || string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(appointment.CarId))
                return BadRequest("Userid and carid is not present");

            await _appointmentService.CreateAsync(appointment);
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");
            if (user.AppointmentId == null)
            {
                user.AppointmentId = new List<string>();
            }
            user.AppointmentId.Add(appointment.Id);
            await _userService.UpdateAsync(user.Id, user);
            return CreatedAtAction(nameof(GetAppointmentById), new { id = appointment.Id }, appointment);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAppointmentById(string id)
        {
            var appointment = await _appointmentService.GetByIdAsynch(id);
            if (appointment == null)
                return NotFound();
            return Ok(appointment);
        }
        [HttpGet("user/{userId}/appointments")]
        public async Task<IActionResult> GetAppointmentByUserId(string userId)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound();
            var results = new List<AppointmentDto>();
            foreach (var appointmentid in user.AppointmentId)
            {
                var appointment = await _appointmentService.GetByIdAsynch(appointmentid);
                if (appointment != null)
                {
                    var car = await _carService.GetByIdAsync(appointment.CarId);
                    results.Add(new AppointmentDto
                    {
                        Appointment = appointment,
                        Car = car
                    });
                }
            }
            return Ok(results);
        }
    }
}