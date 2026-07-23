import React, { createContext, useContext, useEffect, useState } from "react";
import { CITIES, City, Coordinates, detectLocation, nearestCity, reverseGeocodeLabel } from "@/lib/geo";

type LocationSource = "gps" | "ip" | "manual" | null;
type LocationStatus = "idle" | "detecting" | "ready" | "error";

type LocationContextType = {
  city: City | null;
  source: LocationSource;
  status: LocationStatus;
  error: string | null;
  // Best-effort human-readable label from reverse geocoding, e.g. "Sector 62, Noida".
  // Display-only - never used for filtering, see lib/geo.ts.
  detectedLabel: string | null;
  detect: () => void;
  setCity: (cityName: string) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = "cars24_location";

type StoredLocation = { city: City; source: LocationSource };

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<City | null>(null);
  const [source, setSource] = useState<LocationSource>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null);

  const persist = (nextCity: City, nextSource: LocationSource) => {
    try {
      const payload: StoredLocation = { city: nextCity, source: nextSource };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // localStorage unavailable (private browsing, etc.) - non-fatal, just won't persist.
    }
  };

  const applyCoords = (coords: Coordinates, nextSource: LocationSource) => {
    const nearest = nearestCity(coords);
    setCityState(nearest);
    setSource(nextSource);
    setStatus("ready");
    setDetectedLabel(null);
    persist(nearest, nextSource);

    // Fire-and-forget: only improves the displayed label, never blocks
    // or changes which city listings are filtered by.
    reverseGeocodeLabel(coords)
      .then((label) => setDetectedLabel(label))
      .catch(() => {});
  };

  const detect = () => {
    setStatus("detecting");
    setError(null);
    detectLocation()
      .then(({ coords, source: detectedSource }) => applyCoords(coords, detectedSource))
      .catch((err) => {
        setStatus("error");
        setError(err?.message || "Could not detect your location.");
      });
  };

  const setCity = (cityName: string) => {
    const match = CITIES.find((c) => c.name === cityName);
    if (!match) return;
    setCityState(match);
    setSource("manual");
    setStatus("ready");
    setDetectedLabel(null);
    persist(match, "manual");
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredLocation = JSON.parse(raw);
        if (parsed?.city?.name) {
          setCityState(parsed.city);
          setSource(parsed.source ?? null);
          setStatus("ready");
          return;
        }
      }
    } catch {
      // corrupt/unavailable storage - fall through to a fresh detect
    }
    detect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocationContext.Provider
      value={{ city, source, status, error, detectedLabel, detect, setCity }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return ctx;
}