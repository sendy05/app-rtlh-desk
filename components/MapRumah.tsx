"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { createMarkerIcon } from "@/lib/leafletIcon";
import { useMapEvents } from "react-leaflet";

// ✅ Import React-Leaflet Components secara dinamis (agar aman di Next.js 16)
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

// ✅ Komponen bantu untuk auto fly ke lokasi pertama
function FlyToLocation({ coordinates }: { coordinates: [number, number] | null }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (coordinates && map) {
      map.flyTo(coordinates, 14);
    }
  }, [coordinates, map]);
  return null;
}

// === Interfaces ===
interface Survey {
  id: number;
  kodeSurvey: string;
  alamat: string;
  desaId: number;
  kecamatanId: number;
  koordinatLat: number;
  koordinatLng: number;
  kondisiAtap?: string;
}
interface Kecamatan {
  kecamatanId: number;
  namakecamatan: string;
}
interface Desa {
  desaId: number;
  namadesa: string;
  kecamatanId: number;
}

// === Komponen Utama ===
export default function MapRumah({
  surveyData,
  kecamatanList,
  desaList,
}: {
  surveyData: Survey[];
  kecamatanList: Kecamatan[];
  desaList: Desa[];
}) {
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [selectedDesa, setSelectedDesa] = useState("");

  // Filter data berdasarkan dropdown
  const filteredSurvey = surveyData.filter((item) => {
    return (
      (selectedKecamatan ? item.kecamatanId == Number(selectedKecamatan) : true) &&
      (selectedDesa ? item.desaId == Number(selectedDesa) : true)
    );
  });

  // Ambil lokasi pertama untuk auto focus
  const firstLocation: [number, number] | null =
    filteredSurvey.length > 0
      ? [filteredSurvey[0].koordinatLat, filteredSurvey[0].koordinatLng]
      : null;

  // === RENDER ===
  return (
    <div className="w-full h-[90vh] flex flex-col gap-3">
      {/* === Filter Kecamatan & Desa === */}
      <div className="flex gap-2 bg-white shadow-md p-3 rounded-md z-[1000] w-full md:w-[500px]">
        <select
          className="border p-2 rounded w-1/2"
          value={selectedKecamatan}
          onChange={(e) => {
            setSelectedKecamatan(e.target.value);
            setSelectedDesa("");
          }}
        >
          <option value="">Pilih Kecamatan</option>
          {kecamatanList.map((k) => (
            <option key={k.kecamatanId} value={k.kecamatanId}>
              {k.namakecamatan}
            </option>
          ))}
        </select>

        <select
            className="border p-2 rounded w-1/2"
            value={selectedDesa}
            onChange={(e) => setSelectedDesa(e.target.value)}
            >
            <option value="">Pilih Desa</option>
            {desaList
                .filter((d) => d.kecamatanId == Number(selectedKecamatan))
                .map((d) => (
                <option key={d.desaId} value={d.desaId}>
                    {d.namadesa}
                </option>
                ))}
            </select>
      </div>

      {/* === PETA === */}
      <div className="flex-1 rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={[-1.3, 99.2]} // Ganti sesuai wilayah kamu
          zoom={11}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          />

          <FlyToLocation coordinates={firstLocation} />

          {filteredSurvey.map((item) => {
            const desa = desaList.find((d) => d.desaId === item.desaId);
            const kec = kecamatanList.find((k) => k.kecamatanId === item.kecamatanId);
            return (
              <Marker
                key={item.id}
                icon={createMarkerIcon()}
                position={[item.koordinatLat, item.koordinatLng]}
              >
                <Popup>
                  <b>Kode Survey:</b> {item.kodeSurvey} <br />
                  <b>Alamat:</b> {item.alamat} <br />
                  <b>Desa:</b> {desa?.namadesa || "-"} <br />
                  <b>Kecamatan:</b> {kec?.namakecamatan || "-"} <br />
                  <b>Kondisi Atap:</b> {item.kondisiAtap || "-"}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
