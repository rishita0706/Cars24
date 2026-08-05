using Cars24API.Models;
using Cars24API.Utils;

namespace Cars24API.Services
{
    public class PricingService
    {
        private const double MinTotalAdjustment = -10.0;
        private const double MaxTotalAdjustment = 12.0;

        // Cities with the largest, most liquid used-car markets in India.
        private static readonly HashSet<string> HighDemandMetros = new(StringComparer.OrdinalIgnoreCase)
        {
            "Delhi", "Gurugram", "Noida", "Mumbai", "Bengaluru"
        };

        public PriceRecommendation ComputeRecommendedPrice(Car car, string? city, DateTime? asOf = null)
        {
            var date = asOf ?? DateTime.UtcNow;
            var basePrice = CarInsights.ParsePrice(car.Price) ?? 0;
            var bodyType = CarInsights.ClassifyBodyType(car.Title);

            var factors = new List<PricingFactor>();

            var seasonal = SeasonalFactor(date.Month, bodyType);
            if (seasonal.Percent != 0) factors.Add(seasonal);

            var regional = RegionalDemandFactor(city);
            if (regional.Percent != 0) factors.Add(regional);

            var fuelFactor = FuelEfficiencyFactor(car.Specs?.Fuel, bodyType);
            if (fuelFactor.Percent != 0) factors.Add(fuelFactor);

            var totalPercent = Math.Clamp(
                factors.Sum(f => f.Percent), MinTotalAdjustment, MaxTotalAdjustment);

            var recommendedPrice = basePrice > 0
                ? Math.Round(basePrice * (1 + totalPercent / 100.0) / 100.0) * 100.0
                : 0;

            return new PriceRecommendation
            {
                BasePrice = basePrice,
                RecommendedPrice = recommendedPrice,
                AdjustmentPercent = totalPercent,
                Factors = factors
            };
        }

        private static PricingFactor SeasonalFactor(int month, string bodyType)
        {
            if (month == 5 || month == 6)
                return new PricingFactor
                {
                    Name = "Pre-Monsoon Demand",
                    Percent = 3,
                    Reason = "Broad seasonal demand uplift ahead of monsoon (May-Jun)."
                };

            if (month >= 7 && month <= 9)
            {
                return bodyType is "SUV" or "MUV"
                    ? new PricingFactor
                    {
                        Name = "Monsoon Season",
                        Percent = 1,
                        Reason = "SUVs/MUVs hold value better in monsoon thanks to ground clearance."
                    }
                    : new PricingFactor
                    {
                        Name = "Monsoon Season",
                        Percent = -3,
                        Reason = "Lower footfall and flood-damage caution soften prices (Jul-Sep)."
                    };
            }

            // Festive season (Oct-Nov): Diwali/wedding-season seller's market.
            if (month == 10 || month == 11)
                return new PricingFactor
                {
                    Name = "Festive Season",
                    Percent = 5,
                    Reason = "Diwali/wedding-season demand spike (Oct-Nov)."
                };

            // Year-end / financial-year-end clearance windows.
            if (month == 12 || month == 3)
                return new PricingFactor
                {
                    Name = "Clearance Window",
                    Percent = -3,
                    Reason = "Year-end or financial-year-end clearance pricing."
                };

            return new PricingFactor { Name = "Seasonal", Percent = 0, Reason = "No significant seasonal effect this month." };
        }

        private static PricingFactor RegionalDemandFactor(string? city)
        {
            var trimmed = city?.Trim();
            if (!string.IsNullOrEmpty(trimmed) && HighDemandMetros.Contains(trimmed))
            {
                return new PricingFactor
                {
                    Name = "Regional Demand",
                    Percent = 2,
                    Reason = $"{trimmed} is a high-liquidity used-car market."
                };
            }
            return new PricingFactor { Name = "Regional Demand", Percent = 0, Reason = "Standard regional demand." };
        }

        private static PricingFactor FuelEfficiencyFactor(string? fuel, string bodyType)
        {
            var normalizedFuel = fuel?.Trim().ToLowerInvariant() ?? "";

            if (normalizedFuel == "cng")
                return new PricingFactor
                {
                    Name = "Fuel Efficiency",
                    Percent = 4,
                    Reason = "Low running cost makes CNG cars more sought-after as fuel prices rise."
                };

            if (normalizedFuel == "electric")
                return new PricingFactor
                {
                    Name = "Fuel Efficiency",
                    Percent = 3,
                    Reason = "Rising fuel prices strengthen the case for EVs."
                };

            if (bodyType == "Hatchback" && (normalizedFuel == "petrol" || normalizedFuel == ""))
                return new PricingFactor
                {
                    Name = "Fuel Efficiency",
                    Percent = 2,
                    Reason = "Fuel-efficient small cars see stronger demand as running costs rise."
                };

            if (bodyType == "SUV" && normalizedFuel == "diesel")
                return new PricingFactor
                {
                    Name = "Fuel Efficiency",
                    Percent = -2,
                    Reason = "Larger diesel SUVs carry a higher running-cost headwind."
                };

            return new PricingFactor { Name = "Fuel Efficiency", Percent = 0, Reason = "No significant running-cost effect." };
        }
    }
}
