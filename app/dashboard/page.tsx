"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";

interface User {
  id: number;
  name: string;
  email: string;
  nip: string;
  role: string;
}

interface Ringkasan {
  total: number;
  layak: number;
  tidakLayak: number;
  prioritas: {
    satu: number;
    dua: number;
    tiga: number;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ringkasan, setRingkasan] = useState<Ringkasan | null>(null);

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
    const fetchRingkasan = async () => {
      const res = await fetch("/api/ringkasan");
      if (res.ok) {
        const data = await res.json();
        setRingkasan(data);
      }
    };
    fetchRingkasan();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Memuat data...
      </div>
    );
  }

  const COLORS = ["#16a34a", "#dc2626", "#3b82f6"];

  const pieData = [
    { name: "Layak Huni", value: ringkasan?.layak || 0 },
    { name: "Tidak Layak Huni", value: ringkasan?.tidakLayak || 0 },
  ];

  const barData = [
    { name: "Prioritas 1", jumlah: ringkasan?.prioritas.satu || 0 },
    { name: "Prioritas 2", jumlah: ringkasan?.prioritas.dua || 0 },
    { name: "Prioritas 3", jumlah: ringkasan?.prioritas.tiga || 0 },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="dashboard" />
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
          {/* ==== Bagian Sambutan ==== */}
          <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-2">Selamat Datang, {user.name}</h2>
            <p className="text-sm text-blue-100">
              Anda sedang berada di panel kontrol sistem manajemen Rumah Tidak Layak Huni (RTLH).
            </p>
          </section>

          {/* ==== Ringkasan Data ==== */}
          {ringkasan && (
            <>
              <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-2xl shadow text-center">
                  <h3 className="text-gray-600 font-semibold">Total Data Rumah</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{ringkasan.total}</p>
                </div>

                <div className="p-5 bg-white rounded-2xl shadow text-center">
                  <h3 className="text-gray-600 font-semibold">Rumah Tidak Layak</h3>
                  <p className="text-3xl font-bold text-red-500 mt-2">{ringkasan.tidakLayak}</p>
                </div>

                <div className="p-5 bg-white rounded-2xl shadow text-center">
                  <h3 className="text-gray-600 font-semibold">Rumah Layak</h3>
                  <p className="text-3xl font-bold text-green-500 mt-2">{ringkasan.layak}</p>
                </div>

                <div className="p-5 bg-white rounded-2xl shadow text-center">
                  <h3 className="text-gray-600 font-semibold">Prioritas 1 / 2 / 3</h3>
                  <p className="text-xl font-bold text-indigo-600 mt-2">
                    {ringkasan.prioritas.satu} / {ringkasan.prioritas.dua} / {ringkasan.prioritas.tiga}
                  </p>
                </div>
              </section>

              {/* ==== Grafik Data ==== */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow p-5">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
                    Distribusi Rumah Layak & Tidak Layak
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow p-5">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
                    Jumlah Berdasarkan Prioritas
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="jumlah" fill="#6366f1" barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
