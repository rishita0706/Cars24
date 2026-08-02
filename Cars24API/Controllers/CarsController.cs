// Controllers/CarsController.cs
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
        public CarController(CarService carService, CarSearchService searchService, PricingService pricingService, UserService userService, ReferralService referralService)
        {
            _carservice = carService;
            _searchService = searchService;
            _pricingService = pricingService;
            _userService = userService;
            _referralService = referralService;
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var car = await _carservice.GetByIdAsync(id);
            if (car == null)
            {
                return NotFound();
            }

            // Popularity signal for search ranking - never let this fail the
            // actual page load, a view just goes uncounted in that case.
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

        // GET /api/Car/{id}/recommended-price?city=Delhi
        // Returns a PriceRecommendation: { basePrice, recommendedPrice, adjustmentPercent, factors: [...] }
        // `city` is optional - typically the user's geo-fenced city from LocationContext
        // on the frontend. Omitting it just skips the regional-demand factor.
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

            // userId is optional so existing/anonymous listing flows don't
            // break, but without it there's no seller to attribute the
            // listing (or a referral reward) to.
            car.OwnerId = userId;
            await _carservice.CreateAsync(car);

            if (!string.IsNullOrEmpty(userId))
            {
                var seller = await _userService.GetByIdAsync(userId);
                if (seller != null)
                {
                    // Best-effort, same reasoning as BookingController: a
                    // wallet hiccup should never fail the listing itself.
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

        // GET /api/Car/suggestions?q=swi
        // Static literal segment "suggestions" takes routing precedence over the
        // "{id}" parameter route above (same reason "summaries" already coexists
        // with GetById without conflict), so no route ordering changes needed.
        [HttpGet("suggestions")]
        public async Task<IActionResult> GetSuggestions([FromQuery] string? q)
        {
            var suggestions = await _searchService.GetSuggestionsAsync(q);
            return Ok(suggestions);
        }

        // GET /api/Car/search?query=swift&fuel=Petrol&minYear=2018&page=1&pageSize=10&sortBy=relevance
        // Returns a SearchResponse: { totalResults, page, pageSize, totalPages, results: [{ car, score }] }
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] SearchRequest request)
        {
            var results = await _searchService.SearchAsync(request);
            return Ok(results);
        }
    }
}