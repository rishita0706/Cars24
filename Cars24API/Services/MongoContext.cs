using Cars24API.Models;
using MongoDB.Driver;

namespace Cars24API.Services
{
    public class MongoContext
    {
        public IMongoCollection<Car> Cars { get; }
        public IMongoCollection<User> Users { get; }
        public IMongoCollection<Booking> Bookings { get; }
        public IMongoCollection<Appointment> Appointments { get; }
        public IMongoCollection<WalletTransaction> WalletTransactions { get; }
        public IMongoCollection<NewCar> NewCars { get; }

        public MongoContext(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("Cars24DB");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException(
                    "Missing MongoDB connection string. Set the MONGODB_CONNECTION_STRING " +
                    "environment variable, or 'ConnectionStrings:Cars24DB' in appsettings.json for local dev.");
            }

            var client = new MongoClient(connectionString);

            var database = client.GetDatabase(
                configuration["MongoDB:DatabaseName"]);

            Cars = database.GetCollection<Car>("Cars");
            Users = database.GetCollection<User>("Users");
            Bookings = database.GetCollection<Booking>("Bookings");
            Appointments = database.GetCollection<Appointment>("Appointments");
            WalletTransactions = database.GetCollection<WalletTransaction>("WalletTransactions");
            NewCars = database.GetCollection<NewCar>("NewCars");
        }
    }
}
