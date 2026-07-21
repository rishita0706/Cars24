using Cars24API.Models;
using MongoDB.Driver;

namespace Cars24API.Services
{
    public class BookingService
    {
        private readonly IMongoCollection<Booking> _bookings;
        public BookingService(MongoContext context)
        {
            _bookings = context.Bookings;
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

        public async Task<bool> UpdateAsync(string id, Booking booking)
        {
            var result = await _bookings.ReplaceOneAsync(b => b.Id == id, booking);
            return result.MatchedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _bookings.DeleteOneAsync(b => b.Id == id);
            return result.DeletedCount > 0;
        }
    }
}
