using Cars24API.Models;
using MongoDB.Driver;

namespace Cars24API.Services
{
    public class NewCarQuery
    {
        public string? Search { get; set; }
        public string? Brand { get; set; }
        public string? Fuel { get; set; }
        public string? Transmission { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 12;
    }

    public class NewCarPagedResult
    {
        public List<NewCar> Items { get; set; } = new();
        public int TotalResults { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public List<string> AvailableBrands { get; set; } = new();
    }

    public class NewCarService
    {
        private readonly IMongoCollection<NewCar> _newCars;

        public NewCarService(MongoContext context)
        {
            _newCars = context.NewCars;
        }

        public async Task InsertManyAsync(List<NewCar> cars)
        {
            if (cars.Count == 0) return;
            await _newCars.InsertManyAsync(cars);
        }

        public async Task<NewCar?> GetByIdAsync(string id) =>
            await _newCars.Find(c => c.Id == id).FirstOrDefaultAsync();

        public async Task<NewCarPagedResult> QueryAsync(NewCarQuery query)
        {
            var filterBuilder = Builders<NewCar>.Filter;
            var filters = new List<FilterDefinition<NewCar>>();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var regex = new MongoDB.Bson.BsonRegularExpression(
                    System.Text.RegularExpressions.Regex.Escape(query.Search.Trim()), "i");
                filters.Add(filterBuilder.Or(
                    filterBuilder.Regex(c => c.Brand, regex),
                    filterBuilder.Regex(c => c.Model, regex),
                    filterBuilder.Regex(c => c.Variant, regex)
                ));
            }

            if (!string.IsNullOrWhiteSpace(query.Brand))
                filters.Add(filterBuilder.Eq(c => c.Brand, query.Brand));

            if (!string.IsNullOrWhiteSpace(query.Fuel))
                filters.Add(filterBuilder.Eq(c => c.Fuel, query.Fuel));

            if (!string.IsNullOrWhiteSpace(query.Transmission))
                filters.Add(filterBuilder.Eq(c => c.Transmission, query.Transmission));

            if (query.MinPrice.HasValue)
                filters.Add(filterBuilder.Gte(c => c.Price, query.MinPrice.Value));

            if (query.MaxPrice.HasValue)
                filters.Add(filterBuilder.Lte(c => c.Price, query.MaxPrice.Value));

            var combinedFilter = filters.Count > 0 ? filterBuilder.And(filters) : filterBuilder.Empty;

            var page = query.Page < 1 ? 1 : query.Page;
            var pageSize = query.PageSize is < 1 or > 100 ? 12 : query.PageSize;

            var totalResults = (int)await _newCars.CountDocumentsAsync(combinedFilter);
            var items = await _newCars.Find(combinedFilter)
                .SortByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            var brands = await _newCars.Distinct(c => c.Brand, filterBuilder.Empty).ToListAsync();

            return new NewCarPagedResult
            {
                Items = items,
                TotalResults = totalResults,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalResults / (double)pageSize),
                AvailableBrands = brands.Where(b => !string.IsNullOrWhiteSpace(b)).OrderBy(b => b).ToList()
            };
        }
    }
}
