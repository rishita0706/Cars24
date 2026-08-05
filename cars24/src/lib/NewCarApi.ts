import { apiFetch } from "./apiClient";

const RESOURCE = "/api/NewCars";

export type NewCar = {
  id: string;
  brand: string;
  model: string;
  variant: string;
  price: number;
  mileage: string;
  transmission: string;
  fuel: string;
  engine: string;
  power: string;
  images: string[];
  features: string[];
};

export type NewCarPagedResult = {
  items: NewCar[];
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableBrands: string[];
};

export type NewCarQueryParams = {
  search?: string;
  brand?: string;
  fuel?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
};

export const getNewCars = async (params: NewCarQueryParams): Promise<NewCarPagedResult> => {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.brand) query.append("brand", params.brand);
  if (params.fuel) query.append("fuel", params.fuel);
  if (params.transmission) query.append("transmission", params.transmission);
  if (params.minPrice !== undefined) query.append("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.append("maxPrice", String(params.maxPrice));
  query.append("page", String(params.page ?? 1));
  query.append("pageSize", String(params.pageSize ?? 12));

  return apiFetch(`${RESOURCE}?${query.toString()}`);
};

export const getNewCarById = async (id: string): Promise<NewCar> => {
  return apiFetch(`${RESOURCE}/${id}`);
};
