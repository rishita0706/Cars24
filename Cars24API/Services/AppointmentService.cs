using Cars24API.Models;
using MongoDB.Driver;

namespace Cars24API.Services
{
    public class AppointmentService
    {
        private readonly IMongoCollection<Appointment> _appointment;
        public AppointmentService(IConfiguration config)
        {
            var client = new MongoClient(config.GetConnectionString("Cars24DB"));

            var database = client.GetDatabase(config["MongoDB:DatabaseName"]);
            _appointment = database.GetCollection<Appointment>("Appointments");
        }
        public async Task CreateAsync(Appointment appointment)
        {
            await _appointment.InsertOneAsync(appointment);
        }

        public async Task<Appointment> GetByIdAsynch(string id)
        {
            return await _appointment.Find(a => a.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Appointment>> GetAllAsync()
        {
            return await _appointment.Find(_ => true).ToListAsync();
        }
    }
}