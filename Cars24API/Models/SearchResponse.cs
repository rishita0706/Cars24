// Models/SearchResponse.cs
namespace Cars24API.Models
{
    public class SearchResponse
    {
        public int TotalResults { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public List<SearchResult> Results { get; set; } = new();
    }
}