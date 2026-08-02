using System.Text.RegularExpressions;

namespace Cars24API.Utils
{
    // Shared helpers for parsing Car's free-text numeric fields (Price, Km)
    // and inferring body type from the listing title.
    //
    // Previously CarSearchService and PricingService each carried their own
    // near-identical copy of this logic. Consolidated here when
    // MaintenanceService was about to become a third copy - Car has no
    // structured BodyType/numeric Price/Km fields today, so every feature
    // that needs them has to derive them the same way; better to derive them
    // in exactly one place.
    public static class CarInsights
    {
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

        // Body type isn't a field on Car, so it's inferred from the listing
        // title against known nameplates. Unmatched titles default to
        // "Sedan" - a neutral body type with no ground-clearance premium/
        // penalty in pricing, and a mid-range maintenance baseline.
        public static string ClassifyBodyType(string? title)
        {
            if (string.IsNullOrWhiteSpace(title)) return "Sedan";
            if (SuvKeywords.Any(k => title.Contains(k, StringComparison.OrdinalIgnoreCase))) return "SUV";
            if (MuvKeywords.Any(k => title.Contains(k, StringComparison.OrdinalIgnoreCase))) return "MUV";
            if (HatchbackKeywords.Any(k => title.Contains(k, StringComparison.OrdinalIgnoreCase))) return "Hatchback";
            return "Sedan";
        }

        // Strips everything except digits and '.' so "45,000", "45,000 km",
        // "45000" all parse the same way. Returns null when nothing numeric
        // is present.
        public static double? ParseNumeric(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            var digits = Regex.Replace(raw, @"[^\d.]", "");
            return double.TryParse(digits, out var value) ? value : null;
        }

        // Car.Price is free text like "₹7.80 Lakh" or "₹42,00,000", not a raw
        // number - "lakh"/"crore" suffixes have to resolve to an actual
        // multiplier, not just get stripped along with the other characters.
        public static double? ParsePrice(string? raw)
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
