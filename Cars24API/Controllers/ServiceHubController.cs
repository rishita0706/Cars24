using Microsoft.AspNetCore.Mvc;
using Cars24API.Services;

namespace Cars24API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceHubController : ControllerBase
    {
        private readonly ServiceHubService _service;

        public ServiceHubController(ServiceHubService service)
        {
            _service = service;
        }

        // GET /api/ServiceHub?city=Delhi&type=Hub
        [HttpGet]
        public async Task<IActionResult> GetByCity([FromQuery] string? city, [FromQuery] string? type)
        {
            var hubs = await _service.GetByCityAsync(city, type);
            return Ok(hubs);
        }
    }
}
