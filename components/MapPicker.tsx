"use client";

import dynamic from "next/dynamic";

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

// Import komponen Leaflet hanya di client side
const MapInternal = dynamic(() => import("./MapInternal"), {
  ssr: false,
});

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  return (
    <div className="w-full h-64 rounded-md overflow-hidden border border-gray-300 mt-2">
      <MapInternal lat={lat} lng={lng} onChange={onChange} />
    </div>
  );
}
