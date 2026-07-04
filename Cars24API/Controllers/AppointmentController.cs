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

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");
            user.AppointmentId ??= new List<string>(); // legacy user docs may still have this stored as null

            // A freshly created appointment always starts out as "upcoming"
            if (string.IsNullOrEmpty(appointment.Status))
            {
                appointment.Status = "upcoming";
            }

            await _appointmentService.CreateAsync(appointment);

            user.AppointmentId.Add(appointment.Id!);
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
            user.AppointmentId ??= new List<string>(); // legacy user docs may still have this stored as null
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
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(string id, [FromBody] Appointment appointment)
        {
            if (appointment == null)
                return BadRequest("Appointment data is required");

            var existing = await _appointmentService.GetByIdAsynch(id);
            if (existing == null)
                return NotFound("Appointment not found");

            appointment.Id = id; // keep the original id, ignore any id sent in the body
            var updated = await _appointmentService.UpdateAsync(id, appointment);
            if (!updated)
                return NotFound("Appointment not found");

            return Ok(appointment);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(string id, [FromQuery] string? userId)
        {
            var existing = await _appointmentService.GetByIdAsynch(id);
            if (existing == null)
                return NotFound("Appointment not found");

            await _appointmentService.DeleteAsync(id);

            // Also detach the appointment reference from the owning user, if provided
            if (!string.IsNullOrEmpty(userId))
            {
                var user = await _userService.GetByIdAsync(userId);
                if (user != null && (user.AppointmentId?.Remove(id) ?? false))
                {
                    await _userService.UpdateAsync(user.Id, user);
                }
            }

            return NoContent();
        }
    }
}