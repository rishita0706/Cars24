import { useEffect, useRef } from "react";
import type { City } from "@/lib/geo";
import type { ServiceHub } from "@/lib/ServiceHubapi";

type Props = {
  center: City;
  hubs: ServiceHub[];
};

const TYPE_LABEL: Record<string, string> = {
  Hub: "Hub",
  ServiceCenter: "Service Center",
  PickupPoint: "Pickup Point",
};

// Renders with plain Leaflet + OpenStreetMap raster tiles (not react-leaflet)
// so there's no extra dependency on the project's React/Next version - this
// only needs the `leaflet` package. Must be rendered client-only:
//   const NearbyHubsMap = dynamic(() => import(".../NearbyHubsMap"), { ssr: false });
export default function NearbyHubsMap({ center, hubs }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      // Leaflet's default marker icon paths don't survive bundling - point
      // them at the CDN copies instead of the (missing) local asset paths.
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current).setView([center.lat, center.lng], 11);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapRef.current);
      } else {
        mapRef.current.setView([center.lat, center.lng], 11);
      }

      // Clear markers from a previous city/hub set before drawing the current one.
      mapRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapRef.current.removeLayer(layer);
      });

      hubs.forEach((hub) => {
        L.marker([hub.latitude, hub.longitude])
          .addTo(mapRef.current)
          .bindPopup(
            `<strong>${hub.name}</strong><br/>${TYPE_LABEL[hub.type] ?? hub.type}<br/>${hub.address}`
          );
      });
    });

    return () => {
      cancelled = true;
    };
  }, [center, hubs]);

  // Real cleanup only on unmount, kept separate from the effect above so
  // switching city/hubs doesn't tear the map down and recreate it each time.
  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-64 rounded-lg overflow-hidden border border-gray-200"
    />
  );
}