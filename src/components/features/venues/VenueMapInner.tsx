"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Venue } from "@/lib/types";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function VenueMapInner({
  venues,
  center,
}: {
  venues: Venue[];
  center: { lat: number; lng: number };
}) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={11} className="h-64 w-full overflow-hidden rounded-2xl shadow-soft" scrollWheelZoom={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
      {venues.map((v) => (
        <Marker key={v.id} position={[v.lat, v.lng]} icon={icon}>
          <Popup>
            <strong>{v.name}</strong>
            <br />
            {v.area}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
