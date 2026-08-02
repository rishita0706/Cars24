"use client";
import { Button } from "@/components/ui/button";
import { searchCars, type SearchResultItem } from "@/lib/Carapi";
import AdvancedFilters, {
  DEFAULT_FILTERS,
  type Filters,
} from "@/components/buy-car/AdvancedFilters";
import SearchBar from "@/components/buy-car/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";
import { useLocation } from "@/context/LocationContext";
import { getServiceHubs, type ServiceHub } from "@/lib/ServiceHubapi";
import { ChevronLeft, ChevronRight, Heart, MapPin, Navigation, Building2, Wrench, Store } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

// Leaflet touches `window`, so this must never be rendered on the server.
const NearbyHubsMap = dynamic(() => import("@/components/location/NearbyHubsMap"), {
  ssr: false,
});

interface CarCardData {
  id: string;
  title: string;
  km: string;
  fuel: string;
  transmission: string;
  owner: string;
  emi: string;
  price: string;
  location: string;
  image: string;
}

function LoaderCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse overflow-hidden">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

// Flattens a search result's nested `specs` into the flat shape the card UI renders.
function toCardData(item: SearchResultItem): CarCardData {
  const { car } = item;
  return {
    id: car.id,
    title: car.title,
    km: car.specs?.km ?? "",
    fuel: car.specs?.fuel ?? "",
    transmission: car.specs?.transmission ?? "",
    owner: car.specs?.owner ?? "",
    emi: car.emi,
    price: car.price,
    location: car.location,
    image: car.images?.[0] ?? "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  };
}

const PAGE_SIZE = 9;

const BuyCarPage = () => {
  const { city } = useLocation();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  // Geo-fencing default: once a city is known, results are restricted to it
  // until the user explicitly opts out.
  const [restrictToCity, setRestrictToCity] = useState(true);

  const [cars, setCars] = useState<CarCardData[] | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Hubs & Map filter state
  const [hubs, setHubs] = useState<ServiceHub[]>([]);
  const [activeHubType, setActiveHubType] = useState<string>("All");
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);

  // Debounce free-text query so every keystroke doesn't trigger a full search
  const debouncedQuery = useDebounce(query, 350);

  // Reset to page 1 whenever search filters or geo-fencing changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filters, restrictToCity, city?.name]);

  useEffect(() => {
    let cancelled = false;
    setCars(null);
    setError(null);

    searchCars({
      query: debouncedQuery || undefined,
      // Geo-fencing: only listings in the detected/selected city
      location: restrictToCity && city ? city.name : undefined,
      fuel: filters.fuel.length > 0 ? filters.fuel : undefined,
      transmission: filters.transmission.length > 0 ? filters.transmission : undefined,
      minYear: filters.minYear ?? undefined,
      maxYear: filters.maxYear ?? undefined,
      minMileage: filters.minMileage ?? undefined,
      maxMileage: filters.maxMileage ?? undefined,
      minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
      maxPrice:
        filters.priceRange[1] < DEFAULT_FILTERS.priceRange[1]
          ? filters.priceRange[1]
          : undefined,
      sortBy: filters.sortBy,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((response) => {
        if (cancelled) return;
        setCars(response.results.map(toCardData));
        setTotalPages(response.totalPages);
        setTotalResults(response.totalResults);
      })
      .catch((err) => {
        if (cancelled) return;
        setCars([]);
        setError(err?.message || "Could not load cars right now.");
      });

    return () => {
      cancelled = true;
    };
  }, [
    debouncedQuery,
    filters.fuel.join(","),
    filters.transmission.join(","),
    filters.minYear,
    filters.maxYear,
    filters.minMileage,
    filters.maxMileage,
    filters.priceRange[0],
    filters.priceRange[1],
    filters.sortBy,
    page,
    restrictToCity,
    city?.name,
  ]);

  // Fetch nearby hubs for the current city
  useEffect(() => {
    if (!city) {
      setHubs([]);
      return;
    }
    let cancelled = false;
    getServiceHubs(city.name)
      .then((result) => {
        if (!cancelled) setHubs(result);
      })
      .catch(() => {
        if (!cancelled) setHubs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [city?.name]);

  const filteredHubs = hubs.filter(
    (h) => activeHubType === "All" || h.type === activeHubType
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters & Nearby Hubs Interactive Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <AdvancedFilters filters={filters} onChange={setFilters} />

            {/* Interactive Location Hubs Map Card */}
            {city && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <Navigation className="h-4 w-4 text-blue-600" />
                      Hubs & Facilities in {city.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Service centers, test drive hubs & pickup points
                    </p>
                  </div>
                </div>

                {/* Hub type filter pills */}
                <div className="flex gap-1 mb-3 overflow-x-auto pb-1 text-[11px] font-medium">
                  {[
                    { id: "All", label: "All" },
                    { id: "Hub", label: "Hubs" },
                    { id: "ServiceCenter", label: "Services" },
                    { id: "PickupPoint", label: "Pickup" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                        activeHubType === tab.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      onClick={() => setActiveHubType(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <NearbyHubsMap
                  center={city}
                  hubs={filteredHubs}
                  selectedHubId={selectedHubId}
                  onSelectHub={(h) => setSelectedHubId(h.id)}
                />

                {/* Hub List below map */}
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {filteredHubs.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">No facilities found for this filter</p>
                  ) : (
                    filteredHubs.map((hub) => {
                      const isSelected = selectedHubId === hub.id;
                      return (
                        <div
                          key={hub.id}
                          onClick={() => setSelectedHubId(hub.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/50 shadow-sm"
                              : "border-gray-100 hover:border-gray-300 bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-gray-900 mb-1">
                            <span className="truncate pr-2">{hub.name}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                hub.type === "Hub"
                                  ? "bg-blue-100 text-blue-700"
                                  : hub.type === "ServiceCenter"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {hub.type}
                            </span>
                          </div>
                          <p className="text-gray-500 text-[11px] line-clamp-1">{hub.address}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cars Grid & Results Header */}
          <div className="lg:col-span-3">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">
                    Used Cars {restrictToCity && city ? `in ${city.name}` : "Across India"}
                  </h1>
                  {cars !== null && !error && (
                    <p className="text-xs text-gray-500 mt-1">
                      Showing <span className="font-semibold text-gray-900">{totalResults}</span> verified {totalResults === 1 ? "car" : "cars"}
                    </p>
                  )}
                </div>
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  onSubmit={(v) => {
                    setQuery(v);
                    setPage(1);
                  }}
                />
              </div>

              {/* Geo-fencing Status Bar */}
              {city && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    <span>
                      {restrictToCity
                        ? `Geo-fenced: Only showing listings in ${city.name}`
                        : "Location filter disabled: Showing cars from all locations"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
                    onClick={() => setRestrictToCity((v) => !v)}
                  >
                    {restrictToCity ? "Show listings in all cities" : `Restrict listings to ${city.name}`}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="text-center py-12 text-red-600 bg-red-50 rounded-2xl border border-red-100">
                {error}
              </div>
            )}

            {!error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars === null
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <LoaderCard key={index} />
                    ))
                  : cars.map((car) => (
                      <Link
                        key={car.id}
                        href={`/buy-car/${car.id}`}
                        className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-48 overflow-hidden bg-gray-100">
                            <img
                              src={car.image}
                              alt={car.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors"
                            >
                              <Heart className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </button>
                            {car.location && (
                              <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-orange-400" />
                                {car.location}
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {car.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                              <span>{car.km} km</span>
                              <span>•</span>
                              <span>{car.transmission}</span>
                              <span>•</span>
                              <span>{car.fuel}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between mt-auto">
                          <div>
                            <div className="text-[10px] text-gray-400 uppercase font-semibold">EMI starts at</div>
                            <div className="font-bold text-sm text-gray-900">{car.emi}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-gray-400 uppercase font-semibold">Fixed Price</div>
                            <div className="font-extrabold text-base text-blue-600">{car.price}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
              </div>
            )}

            {!error && cars !== null && cars.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">No cars found</h3>
                <p className="text-xs text-gray-500 mb-4">
                  {restrictToCity && city
                    ? `We currently don't have available cars matching your filters in ${city.name}.`
                    : "No cars match your search criteria."}
                </p>
                {restrictToCity && city && (
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold"
                    onClick={() => setRestrictToCity(false)}
                  >
                    View listings from all cities across India
                  </Button>
                )}
              </div>
            )}

            {!error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl text-xs font-medium"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-xs font-semibold text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-xl text-xs font-medium"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCarPage;
