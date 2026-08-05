using Cars24API.Services;
using Cars24API.Middleware;
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
});
builder.Configuration.Sources.Clear();
builder.Configuration
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: false)
    .AddEnvironmentVariables();

// (up to 10 images/request).
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 80 * 1024 * 1024; // 80 MB
    options.ValueLengthLimit = int.MaxValue;
});

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

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

app.UseMiddleware<ApiExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseStaticFiles();

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
