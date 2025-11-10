"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapInternalProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

export default function MapInternal({ lat, lng, onChange }: MapInternalProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    lat && lng ? { lat, lng } : { lat: -1.386, lng: 99.273 }
  );

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return <Marker position={position} icon={icon} />;
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}
