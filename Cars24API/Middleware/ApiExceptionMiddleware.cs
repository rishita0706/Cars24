using System.Net;
using System.Text.Json;

namespace Cars24API.Middleware
{
    public class ApiExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ApiExceptionMiddleware> _logger;

        public ApiExceptionMiddleware(RequestDelegate next, ILogger<ApiExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ApiException apiEx)
            {
                _logger.LogWarning(apiEx, "Handled API exception: {Message}", apiEx.Message);
                await WriteJson(context, (int)apiEx.StatusCode, apiEx.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
                await WriteJson(context, StatusCodes.Status500InternalServerError, FriendlyMessageFor(context));
            }
        }

        private static string FriendlyMessageFor(HttpContext context)
        {
            return "Something went wrong on our end. Please try again in a moment.";
        }

        private static async Task WriteJson(HttpContext context, int statusCode, string message)
        {
            if (context.Response.HasStarted) return;

            context.Response.Clear();
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var payload = JsonSerializer.Serialize(new { message, status = statusCode });
            await context.Response.WriteAsync(payload);
        }
    }

    public static class ApiErrorMessages
    {
        public static string Default(int statusCode) => statusCode switch
        {
            400 => "That request doesn't look right. Please check the details and try again.",
            401 => "Please sign in to continue.",
            403 => "You don't have permission to do that.",
            404 => "We couldn't find what you're looking for.",
            409 => "This conflicts with something that already exists.",
            422 => "Some of the details provided aren't valid.",
            _ => "Something went wrong on our end. Please try again in a moment.",
        };
    }
}
