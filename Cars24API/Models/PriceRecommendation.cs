namespace Cars24API.Models
{
    public class PricingFactor
    {
        public string Name { get; set; } = string.Empty;
        public double Percent { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class PriceRecommendation
    {
        public double BasePrice { get; set; }
        public double RecommendedPrice { get; set; }
        public double AdjustmentPercent { get; set; }
        public List<PricingFactor> Factors { get; set; } = new();
    }
}