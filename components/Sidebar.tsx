"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  Package,
  BarChart3,
  User,
  Settings,
  Check,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  active?: string;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  active = "dashboard",
}: SidebarProps) {
  const router = useRouter();
  const [role, setRole] = useState<"ADMIN" | "SURVEY" | "VERIFIER" | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setRole(data.user?.role || "ADMIN"); // default kalau gagal
      } catch (error) {
        console.error("Gagal ambil role:", error);
      }
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // Daftar semua menu
  const allMenus = [
    { label: "Dashboard", icon: <Home size={18} />, href: "/dashboard", roles: ["ADMIN"] },
    { label: "Data Rumah", icon: <Package size={18} />, href: "/rumah", roles: ["ADMIN", "SURVEY"] },
    { label: "Verifikasi Data", icon: <Check size={18} />, href: "/verifikasi", roles: ["ADMIN", "VERIFIER"] },
    { label: "Data Wilayah", icon: <BarChart3 size={18} />, href: "/wilayah", roles: ["ADMIN", "SURVEY", "VERIFIER"] },
    { label: "Profil", icon: <User size={18} />, href: "/profile", roles: ["ADMIN", "SURVEY", "VERIFIER"] },
    { label: "Pengguna", icon: <Settings size={18} />, href: "/users", roles: ["ADMIN"] },
  ];

  // Filter menu sesuai role
  const menuItems = role ? allMenus.filter((item) => item.roles.includes(role)) : [];

  return (
    <>
      {/* Overlay untuk mode mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-700 capitalize">
              {role} Panel
            </h2>
            <button
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col p-4 space-y-1 text-gray-700">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all w-full text-left ${
                  active === item.href.replace("/", "")
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
