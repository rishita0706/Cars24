import { apiFetch } from "./apiClient";

export type PricingFactor = {
  name: string;
  percent: number;
  reason: string;
};

export type PriceRecommendation = {
  basePrice: number;
  recommendedPrice: number;
  adjustmentPercent: number;
  factors: PricingFactor[];
};

export const getRecommendedPrice = async (
  carId: string,
  city?: string
): Promise<PriceRecommendation> => {
  const query = city ? `?city=${encodeURIComponent(city)}` : "";
  return apiFetch(`/api/Car/${carId}/recommended-price${query}`);
};

// Matches the app's existing "₹7.80 lakh" / "₹1.25 crore" display convention.
export function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Crore`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} Lakh`;
  return `₹${value.toLocaleString("en-IN")}`;
}
