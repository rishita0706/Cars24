using Cars24API.Middleware;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Cars24API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
        private const long MaxFileSizeBytes = 8 * 1024 * 1024; // 8 MB per image
        private const int MaxFilesPerRequest = 10;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("car-images")]
        [RequestSizeLimit(MaxFileSizeBytes * MaxFilesPerRequest)]
        public async Task<IActionResult> UploadCarImages(List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                throw new ApiException("Please choose at least one photo to upload.", HttpStatusCode.BadRequest);

            if (files.Count > MaxFilesPerRequest)
                throw new ApiException($"You can upload up to {MaxFilesPerRequest} photos at a time.", HttpStatusCode.UnprocessableEntity);

            var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads", "cars");
            Directory.CreateDirectory(uploadsRoot);

            var urls = new List<string>();
            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!AllowedExtensions.Contains(extension))
                    throw new ApiException(
                        $"'{file.FileName}' isn't a supported image type. Please use JPG, PNG, or WEBP.",
                        HttpStatusCode.UnprocessableEntity);

                if (file.Length > MaxFileSizeBytes)
                    throw new ApiException(
                        $"'{file.FileName}' is too large. Each photo must be under 8 MB.",
                        HttpStatusCode.UnprocessableEntity);

                var safeName = $"{Guid.NewGuid():N}{extension}";
                var fullPath = Path.Combine(uploadsRoot, safeName);

                await using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativeUrl = $"/uploads/cars/{safeName}";
                var absoluteUrl = $"{Request.Scheme}://{Request.Host}{relativeUrl}";
                urls.Add(absoluteUrl);
            }

            if (urls.Count == 0)
                throw new ApiException("No valid images were uploaded.", HttpStatusCode.UnprocessableEntity);

            return Ok(new { urls });
        }
    }
}
