// src/lib/Carapi.ts
import { apiFetch } from "./apiClient";

const RESOURCE = "/api/Car";

type CarDetails = {
  title: string;
  images: string[];
  price: string;
  emi: string;
  location: string;
  specs: {
    year: number;
    km: string;
    fuel: string;
    transmission: string;
    owner: string;
    insurance: string;
  };
  features: string[];
  highlights: string[];
};

export const createCar = async (carDetails: CarDetails, sellerId?: string) => {
  const query = sellerId ? `?userId=${encodeURIComponent(sellerId)}` : "";
  return apiFetch(`${RESOURCE}${query}`, {
    method: "POST",
    body: JSON.stringify(carDetails),
  });
};

export const getcarByid = async (id: string) => {
  return apiFetch(`${RESOURCE}/${id}`);
};

export const getcarSummaries = async () => {
  return apiFetch(`${RESOURCE}/summaries`);
};

// ---------------------------------------------------------------------------
// Search / Suggestions
// Backed by GET /api/Car/search and GET /api/Car/suggestions (CarSearchService).
//
// NOTE: as of this audit, CarSearchService.SearchAsync on the backend returns
// a bare List<SearchResult>, NOT the paginated SearchResponse shape below.
// Wiring this up in the UI will currently break on `response.results` being
// undefined - fix the backend to return SearchResponse (with pagination
// applied) before connecting this to any search UI.
// ---------------------------------------------------------------------------

export type CarFull = {
  id: string;
  images: string[];
  title: string;
  price: string;
  emi: string;
  location: string;
  specs: {
    year: number;
    km: string;
    fuel: string;
    transmission: string;
    owner: string;
    insurance: string;
  };
  features: string[];
  highlights: string[];
};

export type SearchResultItem = {
  car: CarFull;
  score: number;
};

export type SearchResponse = {
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: SearchResultItem[];
};

export type CarSuggestion = {
  text: string;
  type: string; // "Title" | "Feature" | "Highlight" | "Fuel" | "Transmission" | "Location"
};

export type CarSearchParams = {
  query?: string;
  fuel?: string | string[];
  transmission?: string | string[];
  location?: string;
  owner?: string;
  year?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  minPrice?: number;
  maxPrice?: number;
  features?: string[];
  highlights?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
};

export const searchCars = async (
  params: CarSearchParams
): Promise<SearchResponse> => {
  const query = new URLSearchParams();

  if (params.query) query.append("query", params.query);
  // ASP.NET Core binds repeated query keys into a List<string>, so each item
  // needs its own "fuels="/"transmissions=" entry rather than a single
  // comma-joined value - matches SearchRequest.Fuels/Transmissions on the backend.
  if (Array.isArray(params.fuel)) {
    params.fuel.forEach((f) => query.append("fuels", f));
  } else if (params.fuel) {
    query.append("fuel", params.fuel);
  }
  if (Array.isArray(params.transmission)) {
    params.transmission.forEach((t) => query.append("transmissions", t));
  } else if (params.transmission) {
    query.append("transmission", params.transmission);
  }
  if (params.location) query.append("location", params.location);
  if (params.owner) query.append("owner", params.owner);
  if (params.year !== undefined) query.append("year", String(params.year));
  if (params.minYear !== undefined) query.append("minYear", String(params.minYear));
  if (params.maxYear !== undefined) query.append("maxYear", String(params.maxYear));
  if (params.minMileage !== undefined)
    query.append("minMileage", String(params.minMileage));
  if (params.maxMileage !== undefined)
    query.append("maxMileage", String(params.maxMileage));
  if (params.minPrice !== undefined) query.append("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.append("maxPrice", String(params.maxPrice));
  if (params.page !== undefined) query.append("page", String(params.page));
  if (params.pageSize !== undefined) query.append("pageSize", String(params.pageSize));
  if (params.sortBy) query.append("sortBy", params.sortBy);
  // ASP.NET Core binds repeated query keys into a List<string>, so each item
  // needs its own "features=" / "highlights=" entry rather than a single
  // comma-joined value.
  params.features?.forEach((f) => query.append("features", f));
  params.highlights?.forEach((h) => query.append("highlights", h));

  return apiFetch(`${RESOURCE}/search?${query.toString()}`);
};

export const getCarSuggestions = async (
  q: string
): Promise<CarSuggestion[]> => {
  const trimmed = q.trim();
  if (!trimmed) return [];
  return apiFetch(`${RESOURCE}/suggestions?q=${encodeURIComponent(trimmed)}`);
};
