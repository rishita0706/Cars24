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
  detectedLabel: string | null;
  detect: () => void;
  setCity: (cityName: string) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = "cars24_location";

type StoredLocation = { city: City; source: LocationSource };

const defaultFallbackContext: LocationContextType = {
  city: CITIES[0], // Default snapping city (Delhi)
  source: "manual",
  status: "ready",
  error: null,
  detectedLabel: null,
  detect: () => {},
  setCity: () => {},
};

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<City | null>(CITIES[0]);
  const [source, setSource] = useState<LocationSource>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null);

  const persist = (nextCity: City, nextSource: LocationSource) => {
    try {
      const payload: StoredLocation = { city: nextCity, source: nextSource };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // localStorage unavailable - non-fatal
    }
  };

  const applyCoords = (coords: Coordinates, nextSource: LocationSource) => {
    const nearest = nearestCity(coords);
    setCityState(nearest);
    setSource(nextSource);
    setStatus("ready");
    setDetectedLabel(null);
    persist(nearest, nextSource);

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
    const match = CITIES.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
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
          const matched = CITIES.find((c) => c.name.toLowerCase() === parsed.city.name.toLowerCase()) || parsed.city;
          setCityState(matched);
          setSource(parsed.source ?? null);
          setStatus("ready");
          return;
        }
      }
    } catch {
      // Storage unavailable or corrupt
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

export function useLocation(): LocationContextType {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    return defaultFallbackContext;
  }
  return ctx;
}