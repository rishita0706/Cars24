import { useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, LocateFixed } from "lucide-react";
import { CITIES } from "@/lib/geo";
import { useLocation } from "@/context/LocationContext";

export default function LocationPicker() {
  const { city, status, detectedLabel, detect, setCity } = useLocation();
  const [open, setOpen] = useState(false);
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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600"
        title={detectedLabel ?? undefined}
      >
        <MapPin className="h-4 w-4" />
        <span className="max-w-[110px] truncate">
          {status === "detecting" ? "Detecting..." : city?.name ?? "Select city"}
        </span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-30 p-2">
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-blue-600 hover:bg-gray-50 rounded"
            onClick={() => {
              detect();
              setOpen(false);
            }}
          >
            <LocateFixed className="h-4 w-4" />
            Use my current location
          </button>

          {detectedLabel && (
            <p className="px-2 pb-1 text-xs text-gray-400">Near {detectedLabel}</p>
          )}

          <div className="my-1 border-t border-gray-100" />

          <div className="max-h-56 overflow-auto">
            {CITIES.map((c) => (
              <button
                key={c.name}
                type="button"
                className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 ${
                  city?.name === c.name ? "font-semibold text-blue-600" : "text-gray-700"
                }`}
                onClick={() => {
                  setCity(c.name);
                  setOpen(false);
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}