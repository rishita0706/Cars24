using Cars24API.Models;
using Cars24API.Utils;

namespace Cars24API.Services
{
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

        private static double AgeMultiplier(int ageYears) => ageYears switch
        {
            <= 3 => 1.0,
            <= 6 => 1.6,
            <= 10 => 2.2,
            _ => 2.8,
        };

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

            var kmSinceService = km % 10000;
            var kmToNextService = kmSinceService == 0 ? 10000 : 10000 - kmSinceService;
            insights.Add($"Next scheduled service due in {kmToNextService:N0} km.");

            var kmIntoBrakeCycle = km % 35000;
            if (kmIntoBrakeCycle >= 28000)
                insights.Add("Brake pads likely to need replacement soon.");

            var kmIntoTyreCycle = km % 40000;
            if (kmIntoTyreCycle >= 32000)
                insights.Add("Tire replacement expected in the near future.");

            return insights;
        }
    }
}
