// Models/SearchRequest.cs
namespace Cars24API.Models
{
    public class SearchRequest
    {
        public string? Query { get; set; }

        public string? Fuel { get; set; }

        public string? Transmission { get; set; }

        public List<string>? Fuels { get; set; }

        public List<string>? Transmissions { get; set; }

        public string? Location { get; set; }

        public string? Owner { get; set; }

        public int? Year { get; set; }

        public int? MinYear { get; set; }

        public int? MaxYear { get; set; }

        public int? MinMileage { get; set; }

        public int? MaxMileage { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        public List<string>? Features { get; set; }

        public List<string>? Highlights { get; set; }

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;

        public string SortBy { get; set; } = "relevance";
    }
}