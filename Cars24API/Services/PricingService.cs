using System.Text.RegularExpressions;
using Cars24API.Models;

namespace Cars24API.Services
{
    // Dynamic pricing / "Recommended Price" engine.
    //
    // The adjustment rules below are grounded in documented Indian used-car
    // market behavior rather than the literal illustrative examples in the
    // original feature request. Two of those examples were checked against
    // real market reporting and found to point the wrong way:
    //
    //   - "increase SUV prices during monsoon" - actual reporting (VahanBazaar,
    //     CarArth, 2026) shows the May-Jun PRE-monsoon window is the real demand
    //     spike, and it's broad across body types, not SUV-specific. July-Sep
    //     itself is a buyer's market with softer prices overall (flood-damage
    //     caution suppresses footfall) - SUVs/MUVs simply hold value better
    //     than hatchbacks/sedans in that window (genuine ground-clearance
    //     advantage on waterlogged roads), rather than gaining outright.
    //   - "reduce hatchback value during fuel price spikes" - actual reporting
    //     (CarDekho, industry coverage of 2026 fuel hikes) shows the opposite:
    //     fuel-efficient hatchbacks and CNG cars see INCREASED demand when
    //     fuel prices rise, because running cost becomes the buying priority.
    //
    // This engine implements the directionally-correct version of both. All
    // individual adjustments are deliberately modest (low single-digit %) and
    // the combined total is capped - this drives a "Recommended Price"
    // advisory shown to users, not an authoritative repricing of the actual
    // listing. The city list, keyword lists, and percentages are illustrative
    // starting points, not a precision demand index - they live in one place
    // here so they're easy to tune as real sales data comes in.
    public class PricingService
    {
        private const double MinTotalAdjustment = -10.0;
        private const double MaxTotalAdjustment = 12.0;

        // Cities with the largest, most liquid used-car markets in India.
        private static readonly HashSet<string> HighDemandMetros = new(StringComparer.OrdinalIgnoreCase)
        {
            "Delhi", "Gurugram", "Noida", "Mumbai", "Bengaluru"
        };

        // Body type isn't a field on Car today, so it's inferred from the
        // listing title against known nameplates. Anything unmatched defaults
        // to "Sedan" (a neutral body type with no ground-clearance premium/penalty).
        private static readonly string[] SuvKeywords =
        {
            "Creta", "Nexon", "Brezza", "Vitara", "Seltos", "Venue", "XUV", "Scorpio",
            "Fortuner", "Duster", "Compass", "Harrier", "Safari", "EcoSport", "Kicks",
            "Hector", "Astor", "Taigun", "Kushaq", "Punch"
        };

        private static readonly string[] MuvKeywords =
        {
            "Innova", "Ertiga", "Carens", "Marazzo", "Triber", "XL6"
        };

        private static readonly string[] HatchbackKeywords =
        {
            "Alto", "WagonR", "Wagon R", "Swift", "i10", "Santro", "Kwid", "Celerio",
            "Tiago", "Grand i10", "Ignis", "S-Presso", "Spresso", "Baleno", "Glanza",
            "Polo", "Punto"
        };

        public PriceRecommendation ComputeRecommendedPrice(Car car, string? city, DateTime? asOf = null)
        {
            var date = asOf ?? DateTime.UtcNow;
            var basePrice = ParsePrice(car.Price) ?? 0;
            var bodyType = ClassifyBodyType(car.Title);

            var factors = new List<PricingFactor>();

            var seasonal = SeasonalFactor(date.Month, bodyType);
            if (seasonal.Percent != 0) factors.Add(seasonal);

            var regional = RegionalDemandFactor(city);
            if (regional.Percent != 0) factors.Add(regional);

            var fuelFactor = FuelEfficiencyFactor(car.Specs?.Fuel, bodyType);
            if (fuelFactor.Percent != 0) factors.Add(fuelFactor);

            var totalPercent = Math.Clamp(
                factors.Sum(f => f.Percent), MinTotalAdjustment, MaxTotalAdjustment);

            // Round to the nearest 100 - a "Recommended Price" with paisa-level
            // precision would look like false accuracy given these are demand
            // heuristics, not an appraisal.
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

        private static string ClassifyBodyType(string title)
        {
            if (string.IsNullOrWhiteSpace(title)) return "Sedan";
            if (SuvKeywords.Any(k => title.Contains(k, StringComparison.OrdinalIgnoreCase))) return "SUV";
            if (MuvKeywords.Any(k => title.Contains(k, StringComparison.OrdinalIgnoreCase))) return "MUV";
            if (HatchbackKeywords.Any(k => title.Contains(k, StringComparison.OrdinalIgnoreCase))) return "Hatchback";
            return "Sedan";
        }

        private static PricingFactor SeasonalFactor(int month, string bodyType)
        {
            // Pre-monsoon rush (May-Jun): broad demand spike - buyers want a
            // reliable car before monsoon commutes get difficult.
            if (month == 5 || month == 6)
                return new PricingFactor
                {
                    Name = "Pre-Monsoon Demand",
                    Percent = 3,
                    Reason = "Broad seasonal demand uplift ahead of monsoon (May-Jun)."
                };

            // Monsoon (Jul-Sep): buyer's market overall, but SUVs/MUVs hold
            // value better than hatchbacks/sedans due to genuine ground-clearance
            // advantage on waterlogged roads.
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

        // Mirrors CarSearchService's ParsePriceValue - Car.Price is free text
        // like "₹7.80 Lakh" or "₹42,00,000", not a raw number, so "lakh"/"crore"
        // suffixes have to be resolved to an actual multiplier, not just
        // stripped along with the other non-digit characters.
        private static double? ParsePrice(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;

            var lower = raw.ToLowerInvariant();
            double multiplier = 1;
            if (lower.Contains("crore") || Regex.IsMatch(lower, @"\bcr\b"))
                multiplier = 10000000;
            else if (lower.Contains("lakh") || lower.Contains("lac"))
                multiplier = 100000;

            var digits = Regex.Replace(lower, @"[^\d.]", "");
            return double.TryParse(digits, out var value) ? value * multiplier : null;
        }
    }
}