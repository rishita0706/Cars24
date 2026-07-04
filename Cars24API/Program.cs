using MongoDB.Driver;
using Cars24API.Services;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
string? connectionstring = builder.Configuration.GetConnectionString("Cars24DB");
if (string.IsNullOrEmpty(connectionstring))
{
    throw new InvalidOperationException(
        "Missing 'ConnectionStrings:Cars24DB' in appsettings.json. Add your MongoDB connection string before running the API.");
}
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<CarService>();
builder.Services.AddSingleton<BookingService>();
builder.Services.AddSingleton<AppointmentService>();
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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// NOTE: HTTPS redirection is intentionally not used here. The frontend (cars24)
// is hard-coded to call http://localhost:5213, so redirecting to https would break
// those requests during local development.
app.MapGet("/", () => "Welcome to Cars24 API");
app.MapGet("/db-check", async () =>
{
    try
    {
        var client = new MongoClient(connectionstring);
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