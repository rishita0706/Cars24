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

        // GET /api/ServiceHub?city=Delhi
        // City omitted -> returns every hub across all supported cities.
        [HttpGet]
        public async Task<IActionResult> GetByCity([FromQuery] string? city)
        {
            var hubs = await _service.GetByCityAsync(city);
            return Ok(hubs);
        }
    }
}
