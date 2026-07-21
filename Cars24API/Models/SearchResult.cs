namespace Cars24API.Models
{
    public class SearchResult
    {
        public Car Car { get; set; } = new();

        public int Score { get; set; }
    }
}