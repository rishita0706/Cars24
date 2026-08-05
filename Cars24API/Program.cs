// Program.cs
using Cars24API.Services;
using Cars24API.Middleware;
var builder = WebApplication.CreateBuilder(args);

// Multipart form limits high enough for the sell-car image uploader
// (up to 10 images/request) and dataset uploads (up to 10 MB files).
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 80 * 1024 * 1024; // 80 MB
    options.ValueLengthLimit = int.MaxValue;
});

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Prefer an environment variable (Render/Vercel/production) over appsettings.json
// (local dev only) so the real connection string is never committed to source control.
var envConnectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");
if (!string.IsNullOrEmpty(envConnectionString))
{
    builder.Configuration["ConnectionStrings:Cars24DB"] = envConnectionString;
}

string? connectionstring = builder.Configuration.GetConnectionString("Cars24DB");
if (string.IsNullOrEmpty(connectionstring))
{
    throw new InvalidOperationException(
        "Missing MongoDB connection string. Set the MONGODB_CONNECTION_STRING environment " +
        "variable, or 'ConnectionStrings:Cars24DB' in appsettings.json for local dev.");
}

// MongoContext must be registered before the services that depend on it.
builder.Services.AddSingleton<MongoContext>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<CarService>();
builder.Services.AddSingleton<BookingService>();
builder.Services.AddSingleton<AppointmentService>();
builder.Services.AddSingleton<CarSearchService>();
builder.Services.AddSingleton<ServiceHubService>();
builder.Services.AddSingleton<PricingService>();
builder.Services.AddSingleton<NotificationService>();
builder.Services.AddSingleton<WalletService>();
builder.Services.AddSingleton<ReferralService>();
builder.Services.AddSingleton<MaintenanceService>();
builder.Services.AddSingleton<NewCarService>();
builder.Services.AddSingleton<NewCarImportService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });

});
var app = builder.Build();

// Runs in every environment (dev included) - see ApiExceptionMiddleware for
// why this replaces the old Production-only UseExceptionHandler block: it
// now also understands ApiException, so controllers get real status codes
// and friendly messages instead of everything collapsing to a bare 500.
app.UseMiddleware<ApiExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// UploadController.UploadCarImages actually resolve.
app.UseStaticFiles();

// NOTE: HTTPS redirection is intentionally not used here. The frontend (cars24)
// is configured via NEXT_PUBLIC_API_URL and may point at plain http:// in local dev,
// so redirecting to https would break those requests during local development.
app.MapGet("/", () => "Welcome to Cars24 API");
app.MapGet("/db-check", async () =>
{
    try
    {
        var client = new MongoDB.Driver.MongoClient(connectionstring);
        var dblist = await client.ListDatabaseNamesAsync();
        return Results.Ok("MongoDb connected successfully");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Mongodb connection failed:{ex.Message}");
    }
});
app.UseCors("AllowAll");
app.MapControllers();

app.Run();
