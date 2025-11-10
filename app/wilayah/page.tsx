"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MapRumah from "@/components/MapRumah";

export default function WilayahPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [surveyData, setSurveyData] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [desaList, setDesaList] = useState([]);
  const [loading, setLoading] = useState(true);

   // ✅ Ambil user login
    useEffect(() => {
      const fetchUser = async () => {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          window.location.href = "/login";
        }
      };
      fetchUser();
    }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, k, d] = await Promise.all([
          fetch("/api/rumah"),
          fetch("/api/kecamatan"),
          fetch("/api/desa"),
        ]);
        setSurveyData(await s.json());
        setKecamatanList(await k.json());
        setDesaList(await d.json());
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <p className="p-6">⏳ Memuat data peta...</p>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="wilayah"
      />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
        />
       <main className="p-6 space-y-8">
          <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">📍 Peta Rumah Tidak Layak Huni</h2>
           </div>
          <MapRumah
            surveyData={surveyData}
            kecamatanList={kecamatanList}
            desaList={desaList}
          />
        </main>
      </div>
    </div>
  );
}
