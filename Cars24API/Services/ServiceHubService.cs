using Cars24API.Models;

namespace Cars24API.Services
{
    public class ServiceHubService
    {
        private static readonly List<ServiceHub> Hubs = new()
        {
            // Delhi
            new ServiceHub { Id = "dl-1", Name = "Cars24 Hub - Rohini", City = "Delhi", Type = "Hub", Address = "Metro Walk, Rohini, New Delhi", Latitude = 28.7128, Longitude = 77.1181 },
            new ServiceHub { Id = "dl-2", Name = "Cars24 Service Center - Okhla", City = "Delhi", Type = "ServiceCenter", Address = "Okhla Industrial Area, New Delhi", Latitude = 28.5433, Longitude = 77.2726 },
            new ServiceHub { Id = "dl-3", Name = "Cars24 Pickup Point - Dwarka", City = "Delhi", Type = "PickupPoint", Address = "Sector 12, Dwarka, New Delhi", Latitude = 28.5921, Longitude = 77.0460 },

            // Gurugram
            new ServiceHub { Id = "gg-1", Name = "Cars24 Hub - Udyog Vihar", City = "Gurugram", Type = "Hub", Address = "Udyog Vihar Phase IV, Gurugram", Latitude = 28.4998, Longitude = 77.0902 },
            new ServiceHub { Id = "gg-2", Name = "Cars24 Service Center - Sector 18", City = "Gurugram", Type = "ServiceCenter", Address = "Sector 18, Gurugram", Latitude = 28.4738, Longitude = 77.0836 },
            new ServiceHub { Id = "gg-3", Name = "Cars24 Pickup Point - Golf Course Road", City = "Gurugram", Type = "PickupPoint", Address = "Sector 54, Golf Course Road, Gurugram", Latitude = 28.4385, Longitude = 77.1062 },

            // Noida
            new ServiceHub { Id = "nd-1", Name = "Cars24 Hub - Sector 63", City = "Noida", Type = "Hub", Address = "Sector 63, Noida", Latitude = 28.6266, Longitude = 77.3719 },
            new ServiceHub { Id = "nd-2", Name = "Cars24 Pickup Point - Sector 18", City = "Noida", Type = "PickupPoint", Address = "Sector 18, Noida", Latitude = 28.5697, Longitude = 77.3260 },
            new ServiceHub { Id = "nd-3", Name = "Cars24 Service Center - Sector 80", City = "Noida", Type = "ServiceCenter", Address = "Phase II, Sector 80, Noida", Latitude = 28.5302, Longitude = 77.4011 },

            // Mumbai
            new ServiceHub { Id = "mb-1", Name = "Cars24 Hub - Andheri", City = "Mumbai", Type = "Hub", Address = "Andheri East, Mumbai", Latitude = 19.1136, Longitude = 72.8697 },
            new ServiceHub { Id = "mb-2", Name = "Cars24 Service Center - Chembur", City = "Mumbai", Type = "ServiceCenter", Address = "Chembur, Mumbai", Latitude = 19.0522, Longitude = 72.8994 },
            new ServiceHub { Id = "mb-3", Name = "Cars24 Pickup Point - Thane West", City = "Mumbai", Type = "PickupPoint", Address = "Ghopat, Thane West, Mumbai", Latitude = 19.2062, Longitude = 72.9749 },

            // Bengaluru
            new ServiceHub { Id = "bg-1", Name = "Cars24 Hub - Whitefield", City = "Bengaluru", Type = "Hub", Address = "Whitefield, Bengaluru", Latitude = 12.9698, Longitude = 77.7500 },
            new ServiceHub { Id = "bg-2", Name = "Cars24 Service Center - Electronic City", City = "Bengaluru", Type = "ServiceCenter", Address = "Electronic City, Bengaluru", Latitude = 12.8452, Longitude = 77.6602 },
            new ServiceHub { Id = "bg-3", Name = "Cars24 Pickup Point - Indiranagar", City = "Bengaluru", Type = "PickupPoint", Address = "100 Feet Road, Indiranagar, Bengaluru", Latitude = 12.9784, Longitude = 77.6408 },

            // Pune
            new ServiceHub { Id = "pn-1", Name = "Cars24 Hub - Hinjewadi", City = "Pune", Type = "Hub", Address = "Hinjewadi Phase 1, Pune", Latitude = 18.5912, Longitude = 73.7389 },
            new ServiceHub { Id = "pn-2", Name = "Cars24 Service Center - Hadapsar", City = "Pune", Type = "ServiceCenter", Address = "Magarpatta, Hadapsar, Pune", Latitude = 18.5089, Longitude = 73.9259 },

            // Chennai
            new ServiceHub { Id = "ch-1", Name = "Cars24 Hub - Guindy", City = "Chennai", Type = "Hub", Address = "Guindy Industrial Estate, Chennai", Latitude = 13.0067, Longitude = 80.2206 },
            new ServiceHub { Id = "ch-2", Name = "Cars24 Service Center - Anna Nagar", City = "Chennai", Type = "ServiceCenter", Address = "Anna Nagar West, Chennai", Latitude = 13.0878, Longitude = 80.2096 },

            // Hyderabad
            new ServiceHub { Id = "hy-1", Name = "Cars24 Hub - Gachibowli", City = "Hyderabad", Type = "Hub", Address = "Gachibowli, Hyderabad", Latitude = 17.4401, Longitude = 78.3489 },
            new ServiceHub { Id = "hy-2", Name = "Cars24 Service Center - Kukatpally", City = "Hyderabad", Type = "ServiceCenter", Address = "Kukatpally Industrial Area, Hyderabad", Latitude = 17.4849, Longitude = 78.4138 },

            // Kolkata
            new ServiceHub { Id = "kk-1", Name = "Cars24 Hub - Salt Lake", City = "Kolkata", Type = "Hub", Address = "Sector V, Salt Lake, Kolkata", Latitude = 22.5800, Longitude = 88.4171 },
            new ServiceHub { Id = "kk-2", Name = "Cars24 Service Center - New Town", City = "Kolkata", Type = "ServiceCenter", Address = "Action Area I, New Town, Kolkata", Latitude = 22.5897, Longitude = 88.4682 },

            // Ahmedabad
            new ServiceHub { Id = "ah-1", Name = "Cars24 Hub - SG Highway", City = "Ahmedabad", Type = "Hub", Address = "SG Highway, Thaltej, Ahmedabad", Latitude = 23.0323, Longitude = 72.5108 },
            new ServiceHub { Id = "ah-2", Name = "Cars24 Service Center - Prahlad Nagar", City = "Ahmedabad", Type = "ServiceCenter", Address = "Prahlad Nagar, Ahmedabad", Latitude = 23.0120, Longitude = 72.5028 },
        };

        public Task<List<ServiceHub>> GetByCityAsync(string? city, string? type = null)
        {
            IEnumerable<ServiceHub> query = Hubs;

            if (!string.IsNullOrWhiteSpace(city))
            {
                var trimmedCity = city.Trim();
                query = query.Where(h => h.City.Equals(trimmedCity, StringComparison.OrdinalIgnoreCase) ||
                                         h.City.Contains(trimmedCity, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(type) && !type.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(h => h.Type.Equals(type.Trim(), StringComparison.OrdinalIgnoreCase));
            }

            return Task.FromResult(query.ToList());
        }
    }
}
