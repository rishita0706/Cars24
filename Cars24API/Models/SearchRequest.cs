// Models/SearchRequest.cs
namespace Cars24API.Models
{
    public class SearchRequest
    {
        public string? Query { get; set; }

        public string? Fuel { get; set; }

        public string? Transmission { get; set; }

        public string? Location { get; set; }

        public string? Owner { get; set; }

        public int? Year { get; set; }

        public int? MinYear { get; set; }

        public int? MaxYear { get; set; }

        public int? MinMileage { get; set; }

        public int? MaxMileage { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        // Required to support the "Features" and "Highlights" advanced filters.
        // Additive only - does not touch the Car schema/collection.
        public List<string>? Features { get; set; }

        public List<string>? Highlights { get; set; }

        // Pagination - unset query params keep these defaults because the
        // model binder only overwrites properties actually present in the query string.
        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;

        // relevance (default) | price_asc | price_desc | year_asc | year_desc | km_asc | recent
        public string SortBy { get; set; } = "relevance";
    }
}