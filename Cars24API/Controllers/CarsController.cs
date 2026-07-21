// Controllers/CarsController.cs  (updated — original 3 actions untouched, 2 new ones added)
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
        public CarController(CarService carService, CarSearchService searchService)
        {
            _carservice = carService;
            _searchService = searchService;
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var car = await _carservice.GetByIdAsync(id);
            if (car == null)
            {
                return NotFound();
            }
            return Ok(car);
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
        public async Task<IActionResult> Create([FromBody] Car car)
        {
            if (car == null)
            {
                return BadRequest("Car data is required");
            }
            await _carservice.CreateAsync(car);
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

        // GET /api/Car/search?query=swift&fuel=Petrol&minYear=2018&...
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] SearchRequest request)
        {
            var results = await _searchService.SearchAsync(request);
            return Ok(results);
        }
    }
}