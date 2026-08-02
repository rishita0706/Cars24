namespace Cars24API.Models
{
    public class MaintenanceEstimate
    {
        // "Low" | "Moderate" | "High"
        public string RiskLevel { get; set; } = string.Empty;
        // "Low Maintenance Expected" etc. - ready to render directly.
        public string RiskLabel { get; set; } = string.Empty;
        public double EstimatedAnnualCost { get; set; }
        public double EstimatedMonthlyCost { get; set; }
        public List<string> Insights { get; set; } = new();
        public int CarAgeYears { get; set; }
        public double KmDriven { get; set; }
    }
}
