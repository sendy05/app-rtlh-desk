"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: number;
  name: string;
  email: string;
  nip: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notif, setNotif] = useState<{ type: "success" | "error"; message: string } | null>(null);


  // 🔹 Ambil data user login
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        window.location.href = "/login";
      }
      setLoading(false);
    };
    fetchUser();
  }, []);
  

  // 🔹 Handle ubah password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setNotif({ type: "error", message: "Password baru dan konfirmasi password tidak cocok." });
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotif({ type: "success", message: "Password berhasil dirubah." });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setNotif({ type: "error", message: "Gagal menguah password" });
      }
    } catch (err) {
      setNotif({ type: "error", message: "Terjadi Kesalahan server" });
      console.error(err);
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Memuat profil...</p>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="profile" />
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
          {/* === Judul Halaman === */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">👤 Profil Pengguna</h2>
          </div>

          {/* === Informasi Pengguna === */}
          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Informasi Akun</h3>
            {user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input value={user.name} disabled className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user.email} disabled className="mt-1" />
                </div>
                <div>
                  <Label>NIP</Label>
                  <Input value={user.nip} disabled className="mt-1" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={user.role} disabled className="mt-1 capitalize" />
                </div>
              </div>
            )}
          </section>

          {/* === Form Ubah Password === */}
          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Ubah Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <Label>Password Lama</Label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Password Baru</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Konfirmasi Password Baru</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-700">
                Simpan Perubahan
              </Button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
