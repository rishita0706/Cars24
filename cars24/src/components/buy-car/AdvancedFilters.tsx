import { Slider } from "@/components/ui/slider";

export type Filters = {
  fuel: string[];
  transmission: string[];
  minYear: number | null;
  maxYear: number | null;
  minMileage: number | null;
  maxMileage: number | null;
  priceRange: [number, number];
  sortBy: string;
};

export const DEFAULT_FILTERS: Filters = {
  fuel: [],
  transmission: [],
  minYear: null,
  maxYear: null,
  minMileage: null,
  maxMileage: null,
  priceRange: [0, 2000000],
  sortBy: "relevance",
};

const FUEL_OPTIONS = ["Petrol", "Diesel", "CNG", "Electric"];
const TRANSMISSION_OPTIONS = ["Manual", "Auto"];
const CURRENT_YEAR = new Date().getFullYear();

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function AdvancedFilters({ filters, onChange }: Props) {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button
          type="button"
          className="text-xs text-blue-600 hover:underline"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          Clear all
        </button>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-900">Price Range</label>
        <Slider
          max={2000000}
          step={10000}
          value={filters.priceRange}
          onValueChange={(value) => {
            if (Array.isArray(value) && value.length === 2) {
              update({ priceRange: [value[0], value[1]] });
            }
          }}
        />
        <div className="flex justify-between mt-2 text-sm text-gray-700 font-medium">
          <span>₹{filters.priceRange[0].toLocaleString("en-IN")}</span>
          <span>₹{filters.priceRange[1].toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-900">Fuel Type</label>
        <div className="space-y-2">
          {FUEL_OPTIONS.map((fuel) => (
            <label key={fuel} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={filters.fuel.includes(fuel)}
                onChange={() => update({ fuel: toggle(filters.fuel, fuel) })}
              />
              <span className="ml-2 text-sm text-gray-800 font-medium">{fuel}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-900">Transmission</label>
        <div className="space-y-2">
          {TRANSMISSION_OPTIONS.map((t) => (
            <label key={t} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={filters.transmission.includes(t)}
                onChange={() => update({ transmission: toggle(filters.transmission, t) })}
              />
              <span className="ml-2 text-sm text-gray-800 font-medium">{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Year of manufacture */}
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-900">Year</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            min={1990}
            max={CURRENT_YEAR}
            value={filters.minYear ?? ""}
            onChange={(e) =>
              update({ minYear: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900 bg-white placeholder-gray-400"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="number"
            placeholder="Max"
            min={1990}
            max={CURRENT_YEAR}
            value={filters.maxYear ?? ""}
            onChange={(e) =>
              update({ maxYear: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900 bg-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Mileage (km driven) */}
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-900">Kilometers Driven</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={filters.minMileage ?? ""}
            onChange={(e) =>
              update({ minMileage: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900 bg-white placeholder-gray-400"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={filters.maxMileage ?? ""}
            onChange={(e) =>
              update({ maxMileage: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900 bg-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-900">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => update({ sortBy: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 bg-white"
        >
          <option value="relevance" className="text-gray-900">Relevance</option>
          <option value="price_asc" className="text-gray-900">Price: Low to High</option>
          <option value="price_desc" className="text-gray-900">Price: High to Low</option>
          <option value="year_desc" className="text-gray-900">Year: Newest First</option>
          <option value="year_asc" className="text-gray-900">Year: Oldest First</option>
          <option value="km_asc" className="text-gray-900">Kilometers: Lowest First</option>
          <option value="recent" className="text-gray-900">Recently Listed</option>
        </select>
      </div>
    </div>
  );
}
