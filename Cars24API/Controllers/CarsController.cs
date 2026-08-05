using Microsoft.AspNetCore.Mvc;
using Cars24API.Models;
using Cars24API.Services;


namespace Cars24API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarController : ControllerBase
    {
        private readonly CarService _carservice;
        private readonly CarSearchService _searchService;
        private readonly PricingService _pricingService;
        private readonly UserService _userService;
        private readonly ReferralService _referralService;
        private readonly MaintenanceService _maintenanceService;
        public CarController(CarService carService, CarSearchService searchService, PricingService pricingService, UserService userService, ReferralService referralService, MaintenanceService maintenanceService)
        {
            _carservice = carService;
            _searchService = searchService;
            _pricingService = pricingService;
            _userService = userService;
            _referralService = referralService;
            _maintenanceService = maintenanceService;
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var car = await _carservice.GetByIdAsync(id);
            if (car == null)
            {
                return NotFound();
            }

            try
            {
                await _carservice.IncrementViewCountAsync(id);
            }
            catch
            {
                // intentionally swallowed - non-critical
            }

            return Ok(car);
        }

        [HttpGet("{id}/recommended-price")]
        public async Task<IActionResult> GetRecommendedPrice(string id, [FromQuery] string? city)
        {
            var car = await _carservice.GetByIdAsync(id);
            if (car == null)
            {
                return NotFound();
            }

            var recommendation = _pricingService.ComputeRecommendedPrice(car, city);
            return Ok(recommendation);
        }

        [HttpGet("{id}/maintenance-estimate")]
        public async Task<IActionResult> GetMaintenanceEstimate(string id)
        {
            var car = await _carservice.GetByIdAsync(id);
            if (car == null)
            {
                return NotFound();
            }

            var estimate = _maintenanceService.Estimate(car);
            return Ok(estimate);
        }

        [HttpGet("summaries")]
        public async Task<IActionResult> GetCarsummaries()
        {
            var cars = await _carservice.GetAllAsync();
            var result = cars.Select(car => new
            {
                car.Id,
                car.Title,
                km = car.Specs.Km,
                Fuel = car.Specs.Fuel,
                Transmission = car.Specs.Transmission,
                Owner = car.Specs.Owner,
                car.Emi,
                car.Price,
                car.Location,
                image = car.Images.FirstOrDefault() ?? string.Empty
            });
            return Ok(result);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromQuery] string? userId, [FromBody] Car car)
        {
            if (car == null)
            {
                return BadRequest("Car data is required");
            }

            car.OwnerId = userId;
            await _carservice.CreateAsync(car);

            if (!string.IsNullOrEmpty(userId))
            {
                var seller = await _userService.GetByIdAsync(userId);
                if (seller != null)
                {
                    try
                    {
                        await _referralService.TryGrantRewardAsync(seller);
                    }
                    catch
                    {
                        // swallowed - non-critical to the listing itself
                    }
                }
            }

            return CreatedAtAction(nameof(GetById), new { id = car.Id }, car);
        }

        [HttpGet("suggestions")]
        public async Task<IActionResult> GetSuggestions([FromQuery] string? q)
        {
            var suggestions = await _searchService.GetSuggestionsAsync(q);
            return Ok(suggestions);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] SearchRequest request)
        {
            var results = await _searchService.SearchAsync(request);
            return Ok(results);
        }
    }
}