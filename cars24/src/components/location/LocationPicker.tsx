import { useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, LocateFixed, Search, Check } from "lucide-react";
import { CITIES } from "@/lib/geo";
import { useLocation } from "@/context/LocationContext";

export default function LocationPicker() {
  const { city, status, source, detectedLabel, detect, setCity } = useLocation();
  const [open, setOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = CITIES.filter((c) =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase().trim())
  );

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-all shadow-sm"
        title={detectedLabel ? `Detected: ${detectedLabel}` : undefined}
      >
        <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0 animate-bounce" />
        <span className="max-w-[120px] truncate">
          {status === "detecting" ? "Detecting..." : city?.name ?? "Select City"}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 lg:left-auto lg:right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3 overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Choose Location</span>
            {source && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                {source === "gps" ? "GPS Located" : source === "ip" ? "IP Located" : "Manual"}
              </span>
            )}
          </div>

          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50/70 hover:bg-blue-100/80 rounded-lg transition-colors mb-2 text-left"
            onClick={() => {
              detect();
              setOpen(false);
            }}
          >
            <LocateFixed className="h-4 w-4 flex-shrink-0 text-blue-600" />
            <span>Use current location</span>
          </button>

          {detectedLabel && (
            <p className="px-3 pb-2 text-xs text-gray-500 truncate">
              Near <span className="font-medium text-gray-700">{detectedLabel}</span>
            </p>
          )}

          <div className="relative my-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search city..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="max-h-52 overflow-y-auto pr-1 space-y-1">
            {filteredCities.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">No matching cities</p>
            ) : (
              filteredCities.map((c) => {
                const isSelected = city?.name === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors text-left ${
                      isSelected
                        ? "bg-blue-600 text-white font-medium shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setCity(c.name);
                      setOpen(false);
                    }}
                  >
                    <span>{c.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-white" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}