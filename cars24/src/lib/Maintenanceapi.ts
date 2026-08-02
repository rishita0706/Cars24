import { apiFetch } from "./apiClient";

export type MaintenanceEstimate = {
  riskLevel: "Low" | "Moderate" | "High";
  riskLabel: string;
  estimatedAnnualCost: number;
  estimatedMonthlyCost: number;
  insights: string[];
  carAgeYears: number;
  kmDriven: number;
};

export const getMaintenanceEstimate = async (
  carId: string
): Promise<MaintenanceEstimate> => {
  return apiFetch(`/api/Car/${carId}/maintenance-estimate`);
};
