using Cars24API.Models;

namespace Cars24API.Services
{
    // Static seed data for demo purposes - hub/service-center locations aren't
    // part of the existing schema, and there's no seeding pipeline yet for a
    // new Mongo collection. Swap the body of GetByCityAsync for a MongoContext-
    // backed collection (same pattern as every other service) once real hub
    // data exists - the public method signature won't need to change.
    public class ServiceHubService
    {
        private static readonly List<ServiceHub> Hubs = new()
        {
            new ServiceHub { Id = "dl-1", Name = "Cars24 Hub - Rohini", City = "Delhi", Type = "Hub", Address = "Metro Walk, Rohini, New Delhi", Latitude = 28.7128, Longitude = 77.1181 },
            new ServiceHub { Id = "dl-2", Name = "Cars24 Service Center - Okhla", City = "Delhi", Type = "ServiceCenter", Address = "Okhla Industrial Area, New Delhi", Latitude = 28.5433, Longitude = 77.2726 },
            new ServiceHub { Id = "dl-3", Name = "Cars24 Pickup Point - Dwarka", City = "Delhi", Type = "PickupPoint", Address = "Sector 12, Dwarka, New Delhi", Latitude = 28.5921, Longitude = 77.0460 },

            new ServiceHub { Id = "gg-1", Name = "Cars24 Hub - Udyog Vihar", City = "Gurugram", Type = "Hub", Address = "Udyog Vihar Phase IV, Gurugram", Latitude = 28.4998, Longitude = 77.0902 },
            new ServiceHub { Id = "gg-2", Name = "Cars24 Service Center - Sector 18", City = "Gurugram", Type = "ServiceCenter", Address = "Sector 18, Gurugram", Latitude = 28.4738, Longitude = 77.0836 },

            new ServiceHub { Id = "nd-1", Name = "Cars24 Hub - Sector 63", City = "Noida", Type = "Hub", Address = "Sector 63, Noida", Latitude = 28.6266, Longitude = 77.3719 },
            new ServiceHub { Id = "nd-2", Name = "Cars24 Pickup Point - Sector 18", City = "Noida", Type = "PickupPoint", Address = "Sector 18, Noida", Latitude = 28.5697, Longitude = 77.3260 },

            new ServiceHub { Id = "mb-1", Name = "Cars24 Hub - Andheri", City = "Mumbai", Type = "Hub", Address = "Andheri East, Mumbai", Latitude = 19.1136, Longitude = 72.8697 },
            new ServiceHub { Id = "mb-2", Name = "Cars24 Service Center - Chembur", City = "Mumbai", Type = "ServiceCenter", Address = "Chembur, Mumbai", Latitude = 19.0522, Longitude = 72.8994 },

            new ServiceHub { Id = "bg-1", Name = "Cars24 Hub - Whitefield", City = "Bengaluru", Type = "Hub", Address = "Whitefield, Bengaluru", Latitude = 12.9698, Longitude = 77.7500 },
            new ServiceHub { Id = "bg-2", Name = "Cars24 Service Center - Electronic City", City = "Bengaluru", Type = "ServiceCenter", Address = "Electronic City, Bengaluru", Latitude = 12.8452, Longitude = 77.6602 },

            new ServiceHub { Id = "pn-1", Name = "Cars24 Hub - Hinjewadi", City = "Pune", Type = "Hub", Address = "Hinjewadi, Pune", Latitude = 18.5912, Longitude = 73.7389 },

            new ServiceHub { Id = "ch-1", Name = "Cars24 Hub - Guindy", City = "Chennai", Type = "Hub", Address = "Guindy, Chennai", Latitude = 13.0067, Longitude = 80.2206 },

            new ServiceHub { Id = "hy-1", Name = "Cars24 Hub - Gachibowli", City = "Hyderabad", Type = "Hub", Address = "Gachibowli, Hyderabad", Latitude = 17.4401, Longitude = 78.3489 },

            new ServiceHub { Id = "kk-1", Name = "Cars24 Hub - Salt Lake", City = "Kolkata", Type = "Hub", Address = "Salt Lake, Kolkata", Latitude = 22.5800, Longitude = 88.4171 },

            new ServiceHub { Id = "ah-1", Name = "Cars24 Hub - SG Highway", City = "Ahmedabad", Type = "Hub", Address = "SG Highway, Ahmedabad", Latitude = 23.0323, Longitude = 72.5108 },
        };

        public Task<List<ServiceHub>> GetByCityAsync(string? city)
        {
            if (string.IsNullOrWhiteSpace(city))
                return Task.FromResult(Hubs.ToList());

            var trimmed = city.Trim();
            var matches = Hubs
                .Where(h => h.City.Contains(trimmed, StringComparison.OrdinalIgnoreCase))
                .ToList();

            return Task.FromResult(matches);
        }
    }
}
