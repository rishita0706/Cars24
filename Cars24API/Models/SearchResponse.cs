// Models/SearchResponse.cs
namespace Cars24API.Models
{
    // Wraps SearchResult in pagination metadata. This is the shape
    // src/lib/Carapi.ts's SearchResponse type expects on the frontend -
    // keep the two in sync if either changes.
    public class SearchResponse
    {
        public int TotalResults { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public List<SearchResult> Results { get; set; } = new();
    }
}