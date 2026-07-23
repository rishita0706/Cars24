import { apiFetch } from "./apiClient";

export type ServiceHub = {
  id: string;
  name: string;
  city: string;
  type: string; // "Hub" | "ServiceCenter" | "PickupPoint"
  address: string;
  latitude: number;
  longitude: number;
};

export const getServiceHubs = async (city?: string): Promise<ServiceHub[]> => {
  const query = city ? `?city=${encodeURIComponent(city)}` : "";
  return apiFetch(`/api/ServiceHub${query}`);
};
