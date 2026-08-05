using Cars24API.Models;
using Cars24API.Services;
using Cars24API.Middleware;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Cars24API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewCarsController : ControllerBase
    {
        private readonly NewCarService _newCarService;
        private readonly NewCarImportService _importService;

        private static readonly string[] AllowedExtensions = { ".csv", ".json", ".xlsx", ".xls" };
        private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

        public NewCarsController(NewCarService newCarService, NewCarImportService importService)
        {
            _newCarService = newCarService;
            _importService = importService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] NewCarQuery query)
        {
            var result = await _newCarService.QueryAsync(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var car = await _newCarService.GetByIdAsync(id);
            if (car == null)
                throw new ApiException("We couldn't find that car.", HttpStatusCode.NotFound);
            return Ok(car);
        }

        [HttpPost("preview")]
        [RequestSizeLimit(MaxFileSizeBytes)]
        public async Task<IActionResult> Preview(IFormFile? file)
        {
            var rows = await ParseAndValidateFile(file);
            var successCount = rows.Count(r => r.Success);
            return Ok(new NewCarImportResult
            {
                ImportBatchId = string.Empty,
                TotalRows = rows.Count,
                SuccessCount = successCount,
                FailureCount = rows.Count - successCount,
                Rows = rows
            });
        }

        [HttpPost("upload")]
        [RequestSizeLimit(MaxFileSizeBytes)]
        public async Task<IActionResult> Upload(IFormFile? file)
        {
            var rows = await ParseAndValidateFile(file);
            var batchId = Guid.NewGuid().ToString("N");

            var validCars = rows
                .Where(r => r.Success && r.Car != null)
                .Select(r => { r.Car!.ImportBatchId = batchId; return r.Car!; })
                .ToList();

            await _newCarService.InsertManyAsync(validCars);

            var result = new NewCarImportResult
            {
                ImportBatchId = batchId,
                TotalRows = rows.Count,
                SuccessCount = validCars.Count,
                FailureCount = rows.Count - validCars.Count,
                Rows = rows
            };

            return Ok(result);
        }

        private async Task<List<NewCarImportRowResult>> ParseAndValidateFile(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                throw new ApiException("Please choose a CSV, JSON, or Excel file to upload.", HttpStatusCode.BadRequest);

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
                throw new ApiException(
                    $"'{extension}' isn't supported. Please upload a .csv, .json, .xlsx, or .xls file.",
                    HttpStatusCode.UnprocessableEntity);

            if (file.Length > MaxFileSizeBytes)
                throw new ApiException("File is too large. Maximum size is 10 MB.", HttpStatusCode.UnprocessableEntity);

            await using var stream = file.OpenReadStream();
            return await _importService.ParseAsync(stream, file.FileName);
        }
    }
}
