export type Coordinates = { lat: number; lng: number };

export type City = {
  name: string;
  lat: number;
  lng: number;
};

export const CITIES: City[] = [
  { name: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Gurugram", lat: 28.4595, lng: 77.0266 },
  { name: "Noida", lat: 28.5355, lng: 77.391 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
];

export function nearestCity(coords: Coordinates): City {
  let best = CITIES[0];
  let bestDist = Infinity;
  for (const city of CITIES) {
    const d = Math.hypot(city.lat - coords.lat, city.lng - coords.lng);
    if (d < bestDist) {
      bestDist = d;
      best = city;
    }
  }
  return best;
}

function getBrowserCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  });
}

async function ipGeolocateCoordinates(): Promise<Coordinates | null> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) return null;
    const data = await response.json();
    if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
      return null;
    }
    return { lat: data.latitude, lng: data.longitude };
  } catch {
    return null;
  }
}

export async function detectLocation(): Promise<{
  coords: Coordinates;
  source: "gps" | "ip";
}> {
  try {
    const coords = await getBrowserCoordinates();
    return { coords, source: "gps" };
  } catch {
    const ipCoords = await ipGeolocateCoordinates();
    if (ipCoords) return { coords: ipCoords, source: "ip" };
    throw new Error(
      "Could not determine your location. Please select your city manually."
    );
  }
}

export async function reverseGeocodeLabel(coords: Coordinates): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&zoom=14&addressdetails=1`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    const data = await response.json();
    const address = data?.address ?? {};
    const locality =
      address.suburb || address.neighbourhood || address.city_district || null;
    const city = address.city || address.town || address.state_district || null;
    if (locality && city) return `${locality}, ${city}`;
    return city || data?.display_name || null;
  } catch {
    return null;
  }
}