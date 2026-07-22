using Cars24API.Models;
using MongoDB.Driver;

namespace Cars24API.Services
{
    public class CarService
    {
        private readonly IMongoCollection<Car> _cars;
        public CarService(MongoContext context)
        {
            _cars = context.Cars;
        }
        public async Task<List<Car>> GetAllAsync() =>
            await _cars.Find(_ => true).ToListAsync();
        public async Task<Car?> GetByIdAsync(string id)
        {
            return await _cars.Find(u => u.Id == id).FirstOrDefaultAsync();
        }
        public async Task CreateAsync(Car car) =>
            await _cars.InsertOneAsync(car);

        // Fire-and-forget-safe: called from CarController.GetById on every
        // detail-page view, feeds the popularity component of search ranking.
        public async Task IncrementViewCountAsync(string id)
        {
            var filter = Builders<Car>.Filter.Eq(c => c.Id, id);
            var update = Builders<Car>.Update.Inc(c => c.ViewCount, 1);
            await _cars.UpdateOneAsync(filter, update);
        }
    }

}
