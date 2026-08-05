using System.Text.RegularExpressions;

namespace Cars24API.Utils
{
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

        public static string ClassifyBodyType(string? title)
        {
            if (string.IsNullOrWhiteSpace(title)) return "Sedan";
            if (SuvKeywords.Any(k => title.Contains(k, StringComparison.OrdinalIgnoreCase))) return "SUV";
            if (MuvKeywords.Any(k => title.Contains(k, StringComparison.OrdinalIgnoreCase))) return "MUV";
            if (HatchbackKeywords.Any(k => title.Contains(k, StringComparison.OrdinalIgnoreCase))) return "Hatchback";
            return "Sedan";
        }

        public static double? ParseNumeric(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            var digits = Regex.Replace(raw, @"[^\d.]", "");
            return double.TryParse(digits, out var value) ? value : null;
        }

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
