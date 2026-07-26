// // Program.cs  (updated — only 2 lines added, everything else identical)
// using MongoDB.Driver;
// using Cars24API.Services;
// var builder = WebApplication.CreateBuilder(args);

// // Add services to the container.

// builder.Services.AddOpenApi();
// builder.Services.AddControllers();
// builder.Services.AddEndpointsApiExplorer();
// string? connectionstring = builder.Configuration.GetConnectionString("Cars24DB");
// if (string.IsNullOrEmpty(connectionstring))
// {
//     throw new InvalidOperationException(
//         "Missing 'ConnectionStrings:Cars24DB' in appsettings.json. Add your MongoDB connection string before running the API.");
// }
// builder.Services.AddSingleton<UserService>();
// builder.Services.AddSingleton<CarService>();
// builder.Services.AddSingleton<BookingService>();
// builder.Services.AddSingleton<AppointmentService>();
// builder.Services.AddSingleton<MongoContext>();
// builder.Services.AddSingleton<CarSearchService>();
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowAll", policy =>
//     {
//         policy.AllowAnyOrigin()
//               .AllowAnyMethod()
//               .AllowAnyHeader();
//     });

// });
// var app = builder.Build();

// // Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.MapOpenApi();
// }

// // NOTE: HTTPS redirection is intentionally not used here. The frontend (cars24)
// // is hard-coded to call http://localhost:5213, so redirecting to https would break
// // those requests during local development.
// app.MapGet("/", () => "Welcome to Cars24 API");
// app.MapGet("/db-check", async () =>
// {
//     try
//     {
//         var client = new MongoClient(connectionstring);
//         var dblist = await client.ListDatabaseNamesAsync();
//         return Results.Ok("MongoDb connected successfully");
//     }
//     catch (Exception ex)
//     {
//         return Results.Problem($"Mongodb connection failed:{ex.Message}");
//     }
// });
// app.UseCors("AllowAll");
// app.MapControllers();

// app.Run();

// Program.cs
using Cars24API.Services;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

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
else
{
    // Production: don't leak stack traces, return a generic 500 instead.
    app.UseExceptionHandler(errApp =>
    {
        errApp.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"message\":\"An unexpected error occurred.\"}");
        });
    });
}

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