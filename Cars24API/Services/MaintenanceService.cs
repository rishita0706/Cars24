using Cars24API.Models;
using Cars24API.Utils;

namespace Cars24API.Services
{
    // Maintenance cost estimator.
    //
    // Base annual costs by body type and the age/mileage multiplier bands
    // below are grounded in 2026 Indian used-car service-cost reporting
    // (Ride N Repair, AutoDecode, CalcWise - annual maintenance ranging from
    // ~Rs 4,000-12,000 for a hatchback in its first 3 years up to
    // Rs 20,000-35,000 for an aging SUV/premium vehicle, with a firm
    // 10,000 km / 12-month service interval in Indian driving conditions).
    // See the comments on each table below for the specific reasoning.
    //
    // This produces a budgeting estimate for a buyer browsing a listing, not
    // a mechanic's inspection report - actual cost depends on the individual
    // car's service history and condition, neither of which Cars24 tracks
    // today. Numbers are rounded (nearest Rs 500 annually, Rs 50 monthly) to
    // avoid implying false precision.
    public class MaintenanceService
    {
        // Rs/year baseline at 0-3 years old, under 40,000 km.
        private static readonly Dictionary<string, double> BaseAnnualCost = new()
        {
            ["Hatchback"] = 8000,
            ["Sedan"] = 15000,
            ["MUV"] = 18000,
            ["SUV"] = 20000,
        };

        // Reported costs roughly double moving from the "years 1-3" band into
        // "years 4-6" as wear items (brakes, suspension bushings, etc.) start
        // appearing, then keep climbing for older cars.
        private static double AgeMultiplier(int ageYears) => ageYears switch
        {
            <= 3 => 1.0,
            <= 6 => 1.6,
            <= 10 => 2.2,
            _ => 2.8,
        };

        // Independent of age - a heavily-driven younger car still wears
        // faster than its age alone would suggest.
        private static double MileageMultiplier(double km) => km switch
        {
            < 40000 => 1.0,
            < 80000 => 1.15,
            < 120000 => 1.35,
            _ => 1.6,
        };

        public MaintenanceEstimate Estimate(Car car, DateTime? asOf = null)
        {
            var now = asOf ?? DateTime.UtcNow;
            var bodyType = CarInsights.ClassifyBodyType(car.Title);
            var km = CarInsights.ParseNumeric(car.Specs?.Km) ?? 0;
            var ageYears = Math.Max(0, now.Year - car.Specs.Year);

            var baseCost = BaseAnnualCost.TryGetValue(bodyType, out var b) ? b : BaseAnnualCost["Sedan"];
            var annualCost = baseCost * AgeMultiplier(ageYears) * MileageMultiplier(km);
            annualCost = Math.Round(annualCost / 500.0) * 500.0;

            var (riskLevel, riskLabel) = ClassifyRisk(ageYears, km);

            return new MaintenanceEstimate
            {
                RiskLevel = riskLevel,
                RiskLabel = riskLabel,
                EstimatedAnnualCost = annualCost,
                EstimatedMonthlyCost = Math.Round(annualCost / 12.0 / 50.0) * 50.0,
                Insights = BuildInsights(km),
                CarAgeYears = ageYears,
                KmDriven = km
            };
        }

        // Matches the original feature spec's own example almost exactly:
        // "a 6-year-old car with over 80,000 km driven" -> High.
        private static (string Level, string Label) ClassifyRisk(int ageYears, double km)
        {
            if (ageYears >= 6 && km >= 80000)
                return ("High", "High Maintenance Expected");
            if (ageYears >= 4 || km >= 60000)
                return ("Moderate", "Moderate Maintenance Expected");
            return ("Low", "Low Maintenance Expected");
        }

        private static List<string> BuildInsights(double km)
        {
            var insights = new List<string>();

            // Standard service interval: every 10,000 km (see class notes).
            var kmSinceService = km % 10000;
            var kmToNextService = kmSinceService == 0 ? 10000 : 10000 - kmSinceService;
            insights.Add($"Next scheduled service due in {kmToNextService:N0} km.");

            // Brake pads: common rule-of-thumb replacement cycle ~35,000 km.
            // Flagged in the last 20% of that cycle (i.e. "coming up soon"),
            // not the whole back half - a flag that's true 50% of the time
            // isn't actionable information.
            var kmIntoBrakeCycle = km % 35000;
            if (kmIntoBrakeCycle >= 28000)
                insights.Add("Brake pads likely to need replacement soon.");

            // Tyres: ~40,000 km cycle, consistent with the reported
            // 35,000-50,000 km tyre-life range across body types.
            var kmIntoTyreCycle = km % 40000;
            if (kmIntoTyreCycle >= 32000)
                insights.Add("Tire replacement expected in the near future.");

            return insights;
        }
    }
}
