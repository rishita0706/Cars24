"use client";
import { Button } from "@/components/ui/button";
import { searchCars, type SearchResultItem } from "@/lib/Carapi";
import AdvancedFilters, {
  DEFAULT_FILTERS,
  type Filters,
} from "@/components/buy-car/AdvancedFilters";
import SearchBar from "@/components/buy-car/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

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
    <div className="bg-white rounded-lg shadow-md animate-pulse overflow-hidden">
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
    image: car.images?.[0] ?? "",
  };
}

const PAGE_SIZE = 9;

const BuyCarPage = () => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const [cars, setCars] = useState<CarCardData[] | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Debounce free-text query so every keystroke doesn't trigger a full search
  // request (the SearchBar's own suggestion dropdown has its own, separate
  // debounce - this one drives the actual results grid below).
  const debouncedQuery = useDebounce(query, 350);

  // Reset to page 1 whenever the user changes what they're searching/filtering for.
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filters]);

  useEffect(() => {
    let cancelled = false;
    setCars(null);
    setError(null);

    searchCars({
      query: debouncedQuery || undefined,
      fuels: filters.fuel.length > 0 ? filters.fuel : undefined,
      transmissions: filters.transmission.length > 0 ? filters.transmission : undefined,
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
    // Depend on the joined string form of fuel/transmission rather than the
    // array reference itself, so a new array with the same values doesn't
    // trigger an unnecessary re-fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, filters.fuel.join(","), filters.transmission.join(","), filters.minYear, filters.maxYear, filters.minMileage, filters.maxMileage, filters.priceRange[0], filters.priceRange[1], filters.sortBy, page]);

  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white text-black">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* filter */}
          <div className="md:col-span-1 space-y-6">
            <AdvancedFilters filters={filters} onChange={setFilters} />
          </div>

          {/* cars grid */}
          <div className="md:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Used Cars in Delhi NCR</h1>
                {cars !== null && !error && (
                  <p className="text-sm text-gray-500 mt-1">
                    {totalResults} {totalResults === 1 ? "car" : "cars"} found
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

            {error && (
              <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg">
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
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-48">
                          <img
                            src={car.image}
                            alt={car.title}
                            className="w-full h-full object-cover"
                          />
                          <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white">
                            <Heart className="h-4 w-4 text-gray-500 hover:text-red-500" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">
                            {car.title}
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-600">
                              {car.km} km
                            </div>
                            <div className="text-sm text-gray-600">
                              {car.transmission}
                            </div>
                            <div className="text-sm text-gray-600">
                              {car.fuel}
                            </div>
                            <div className="text-sm text-gray-600">
                              {car.owner}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-gray-600">
                                EMI from
                              </div>
                              <div className="font-semibold">{car.emi}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Price</div>
                              <div className="font-semibold">{car.price}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {car.location}
                          </div>
                        </div>
                      </Link>
                    ))}
              </div>
            )}

            {!error && cars !== null && cars.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No cars match your search. Try adjusting your filters.
              </div>
            )}

            {!error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
