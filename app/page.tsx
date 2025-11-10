"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotif(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setNotif({ type: "error", message: data.error || "Login gagal, periksa kembali NIP atau password." });
      } else {
        setNotif({ type: "success", message: "Login berhasil! Mengarahkan ke dashboard..." });
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch {
      setNotif({ type: "error", message: "Gagal terhubung ke server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* BAGIAN KIRI: FORM LOGIN */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-8 md:px-16 relative"
      >
        <div className="w-full max-w-sm space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-800 text-center"
          >
            Selamat Datang
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center text-gray-500"
          >
            Silakan masuk untuk melanjutkan ke dashboard
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <Label htmlFor="nip" className="text-gray-700">
                NIP
              </Label>
              <Input
                id="nip"
                type="text"
                placeholder="Masukkan NIP"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div className="relative">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Login"}
            </Button>
          </motion.form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Lupa Password?{" "}
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Riset Password di sini
            </a>
          </p>
        </div>

        {/* NOTIFIKASI */}
        <AnimatePresence>
          {notif && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className={`absolute bottom-8 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white text-sm ${
                notif.type === "success" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {notif.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
              {notif.message}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* BAGIAN KANAN: GAMBAR */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex w-1/2 bg-gradient-to-tr from-blue-500 to-indigo-600 items-center justify-center relative overflow-hidden"
      >
        
        <div className="absolute z-20 text-white px-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold mb-4"
          >
            RTLH App
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-lg text-gray-100"
          >
            Aplikasi Pendataan Rumah Tidak Layak Huni berbasis web.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
