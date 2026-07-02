using Cars24API.Models;
using MongoDB.Driver;

namespace Cars24API.Services
{
    public class BookingService
    {
        private readonly IMongoCollection<Booking> _bookings;
        public BookingService(IConfiguration config)
        {
            var client = new MongoClient(config.GetConnectionString("Cars24DB"));
            var database = client.GetDatabase(config["MongoDB:DatabaseName"]);
            _bookings = database.GetCollection<Booking>("Bookings");
        }
        public async Task CreateAsync(Booking booking)
        {
            await _bookings.InsertOneAsync(booking);
        }

        public async Task<Booking> GetByIdAsynch(string id)
        {
            return await _bookings.Find(a => a.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Booking>> GetAllAsync()
        {
            return await _bookings.Find(_ => true).ToListAsync();
        }
    }
}