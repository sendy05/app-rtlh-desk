"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: number;
  name: string;
  email: string;
  nip: string;
  role: string;
  jabatan: string;
  password: string;
  createdAt: string;
}

export default function UserManagementPage() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    nip: "",
    jabatan: "",
    password: "",
    role: "ADMIN",
  });

  // Cek user login & role
   useEffect(() => {
     const fetchUser = async () => {
       const res = await fetch("/api/me");
       if (res.ok) {
         const data = await res.json();
         setUser(data.user);
         setForm((f) => ({ ...f, createdById: data.user.id }));
 
         // 🚨 CEK ROLE USER DI SINI
         if (data.user.role !== "ADMIN") {
           window.location.href = "/unauthorized";
         }
       } else {
         window.location.href = "/login";
       }
     };
     fetchUser();
   }, []);

  // Fetch users list
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/auth/register");
      if (!res.ok) throw new Error("Gagal memuat user");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast({ title: "❌ Gagal memuat data user" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () =>
    setForm({ id: "", name: "", email: "", nip: "", jabatan: "", password: "", role: "ADMIN" });

  const validateForm = () => {
    if (!form.name || !form.email || !form.nip) {
      toast({ title: "⚠️ Semua field wajib diisi" });
      return false;
    }
    return true;
  };

  // Tambah user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah user");
      toast({ title: "✅ User berhasil ditambahkan" });
      setOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast({ title: err.message });
    } finally {
      setSubmitting(false);
    }
  };

 // Update user
const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.id) {
    toast({ title: "❌ ID user tidak ditemukan" });
    return;
  }

  setSubmitting(true);
  try {
    // Buat body yang akan dikirim (tanpa password dulu)
    const body: any = {
      name: form.name,
      email: form.email,
      nip: form.nip,
      jabatan: form.jabatan,
      role: form.role,
    };

    // Jika password diisi dan tidak kosong, tambahkan ke body
    if (form.password && form.password.trim() !== "") {
      body.password = form.password;
    }

    // ✅ arahkan ke endpoint /api/users/[id]
    const res = await fetch(`/api/auth/register/${form.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) throw new Error(json.error || "Gagal memperbarui user");

    toast({ title: "✅ Data user berhasil diperbarui" });
    setEditOpen(false);
    fetchUsers();
  } catch (err: any) {
    toast({ title: `❌ ${err.message}` });
  } finally {
    setSubmitting(false);
  }
};

  // Hapus user
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    try {
      const res = await fetch(`/api/auth/register/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus user");
      toast({ title: "🗑️ User dihapus" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      toast({ title: err.message });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase()) ||
      u.nip.includes(filter)
  );

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Memuat...
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="users" />
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
            <h2 className="text-xl font-bold">👥 Manajemen User</h2>

            <Dialog open={open} onOpenChange={setOpen}>
              <div className="flex gap-2">
                <DialogTrigger asChild>
                  <Button
                    onClick={() => resetForm()}
                    className="bg-blue-600 text-white"
                  >
                    + Tambah User
                  </Button>
                </DialogTrigger>
              </div>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Tambah User Baru</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3 mt-4">
                  <Input
                    placeholder="Nama Lengkap"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <Input
                    placeholder="NIP"
                    value={form.nip}
                    onChange={(e) => setForm({ ...form, nip: e.target.value })}
                  />
                   <Input
                    placeholder="Jabatan"
                    value={form.jabatan}
                    onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                   />
                  <Input
                    placeholder="Password"
                    value={form.password}
                    type="password"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                   />
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full text-sm"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="VERIFIER">VERIFIER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 text-white w-full"
                  >
                    {submitting ? "Menyimpan..." : "💾 Simpan"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filter */}
          <div className="flex gap-3 bg-white p-4 rounded-lg shadow items-center">
            <Input
              placeholder="Cari nama, email, atau NIP..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="secondary" onClick={() => setFilter("")}>
              Reset
            </Button>
          </div>

          {/* Table */}
          <div className="bg-white p-5 rounded-xl shadow">
            {loading ? (
              <p>Loading...</p>
            ) : (
             <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {filteredUsers.map((u, index) => (
                <TableRow key={u.id}>
                    {/* 🟢 Kolom nomor urut */}
                    <TableCell className="text-center">{index + 1}</TableCell>

                    <TableCell>{u.nip}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.jabatan}</TableCell>

                    <TableCell>
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${u.role === "ADMIN" && "bg-red-100 text-red-600"}
                        ${u.role === "VERIFIER" && "bg-yellow-100 text-yellow-600"}
                        ${u.role === "SURVEY" && "bg-green-100 text-green-600"}
                        `}
                    >
                        {u.role}
                    </span>
                    </TableCell>

                    <TableCell>{u.createdAt?.split("T")[0]}</TableCell>

                    <TableCell className="flex gap-2">
                    <Button
                        size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" 
                        onClick={() => {
                        setForm({
                            id: String(u.id),
                            name: u.name,
                            email: u.email,
                            nip: u.nip,
                            jabatan: u.jabatan,
                            password: "", // kosongkan agar aman
                            role: u.role,
                        });
                        setEditOpen(true);
                        }}
                    >
                        ✏️ Edit
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(u.id)}
                    >
                        🗑️ Delete
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
            )}
          </div>

          {/* Dialog edit user */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleUpdate} className="space-y-3 mt-4">
                <Input
                  placeholder="Nama Lengkap"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  placeholder="NIP"
                  value={form.nip}
                  onChange={(e) => setForm({ ...form, nip: e.target.value })}
                />
                <Input
                  placeholder="Jabatan"
                  value={form.jabatan}
                  onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={form.password || ""}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="border border-gray-300 p-2 rounded w-full text-sm"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="VERIFIER">VERIFIER</option>
                  <option value="SURVEY">SURVEY</option>
                </select>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white w-full"
                >
                  {submitting ? "Menyimpan..." : "💾 Simpan"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
