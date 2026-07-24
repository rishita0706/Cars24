import { useEffect, useRef } from "react";
import type { City } from "@/lib/geo";
import type { ServiceHub } from "@/lib/ServiceHubapi";

type Props = {
  center: City;
  hubs: ServiceHub[];
  selectedHubId?: string | null;
  onSelectHub?: (hub: ServiceHub) => void;
};

const TYPE_LABEL: Record<string, string> = {
  Hub: "Cars24 Hub",
  ServiceCenter: "Service Center",
  PickupPoint: "Pickup Point",
};

const TYPE_COLOR: Record<string, string> = {
  Hub: "#2563eb", // blue
  ServiceCenter: "#ea580c", // orange
  PickupPoint: "#16a34a", // green
};

export default function NearbyHubsMap({ center, hubs, selectedHubId, onSelectHub }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  // Ensure Leaflet CSS stylesheet is loaded into document head
  useEffect(() => {
    if (typeof document !== "undefined" && !document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      // Fix missing leaflet marker icons in bundled environment
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

      // Clear previous markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      hubs.forEach((hub) => {
        const color = TYPE_COLOR[hub.type] || "#2563eb";
        const customIcon = L.divIcon({
          className: "custom-hub-marker",
          html: `<div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        });

        const popupContent = `
          <div style="font-family: inherit; font-size: 13px; min-width: 180px; padding: 2px;">
            <div style="font-weight: 700; color: #111827; margin-bottom: 2px;">${hub.name}</div>
            <div style="display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 9999px; background-color: ${color}15; color: ${color}; margin-bottom: 6px;">
              ${TYPE_LABEL[hub.type] ?? hub.type}
            </div>
            <div style="color: #4b5563; font-size: 11px; margin-bottom: 8px; line-height: 1.3;">${hub.address}</div>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${hub.latitude},${hub.longitude}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="display: inline-flex; items-center; font-size: 11px; font-weight: 600; color: #2563eb; text-decoration: none;"
            >
              Get Directions &rarr;
            </a>
          </div>
        `;

        const marker = L.marker([hub.latitude, hub.longitude], { icon: customIcon })
          .addTo(mapRef.current)
          .bindPopup(popupContent);

        marker.on("click", () => {
          onSelectHub?.(hub);
        });

        markersRef.current.set(hub.id, marker);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [center, hubs, onSelectHub]);

  // Handle programmatic marker selection
  useEffect(() => {
    if (selectedHubId && markersRef.current.has(selectedHubId)) {
      const marker = markersRef.current.get(selectedHubId);
      marker.openPopup();
      mapRef.current?.panTo(marker.getLatLng());
    }
  }, [selectedHubId]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-72 rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0"
    />
  );
}