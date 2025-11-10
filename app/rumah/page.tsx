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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Leaflet
import MapPicker from "@/components/MapPicker";



interface User {
  id: number;
  name: string;
  email: string;
  nip: string;
  role: string;
}

interface Survey {
  id: number;
  kodeSurvey: string;
  alamat: string;
  desaId: number;
  kecamatanId: number;
  desa: { namadesa: string };
  kecamatan: { namakecamatan: string };
  pemilik: string;
  noKK: string;
  luasBangunan: number | null;
  koordinatLat: number | null;
  koordinatLng: number | null;
  kondisiAtap: string | null;
  kondisiDinding: string | null;
  kondisiLantai: string | null;
  sumberAir: string | null;
  sanitasi: string | null;
  jumlahPenghuni: number | null;
  prioritas: number;
  status: string;
  updatedAt: string;
}

export default function SurveyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [desaList, setDesaList] = useState<any[]>([]);

  const [mapModal, setMapModal] = useState(false);
  const [selectedLatLng, setSelectedLatLng] = useState({ lat: 0, lng: 0 });


  // Filter
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [filterDesa, setFilterDesa] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form (note: coordinates stored as strings in form, converted to Number on submit)
  const [form, setForm] = useState({
    id: "",
    kodeSurvey: "",
    alamat: "",
    desaId: "",
    kecamatanId: "",
    pemilik: "",
    noKK: "",
    luasBangunan: "",
    koordinatLat: "",
    koordinatLng: "",
    kondisiAtap: "",
    kondisiDinding: "",
    kondisiLantai: "",
    sumberAir: "",
    sanitasi: "",
    jumlahPenghuni: "",
    prioritas: "3",
    createdById: "",
    status: "",
  });

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const resetForm = () => {
    setForm({
      id: "",
      kodeSurvey: "",
      alamat: "",
      desaId: "",
      kecamatanId: "",
      pemilik: "",
      noKK: "",
      luasBangunan: "",
      koordinatLat: "",
      koordinatLng: "",
      kondisiAtap: "",
      kondisiDinding: "",
      kondisiLantai: "",
      sumberAir: "",
      sanitasi: "",
      jumlahPenghuni: "",
      prioritas: "3",
      createdById: String(user?.id ?? ""),
      status: "",
    });
  };

  // Cek user login & role
   useEffect(() => {
     const fetchUser = async () => {
       const res = await fetch("/api/me");
       if (res.ok) {
         const data = await res.json();
         setUser(data.user);
         setForm((f) => ({ ...f, createdById: data.user.id }));
 
         // 🚨 CEK ROLE USER DI SINI
         if (data.user.role !== "SURVEY" && data.user.role !== "ADMIN") {
           window.location.href = "/unauthorized";
         }
       } else {
         window.location.href = "/login";
       }
     };
     fetchUser();
   }, []);

  // Ambil master kecamatan & desa
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const kec = await fetch("/api/kecamatan").then((r) => r.json());
        const desa = await fetch("/api/desa").then((r) => r.json());
        setKecamatanList(kec);
        setDesaList(desa);
      } catch (e) {
        toast({ title: "⚠️ Gagal memuat data kecamatan/desa" });
      }
    };
    fetchMasterData();
  }, []);

  // Ambil survey
  const fetchSurveys = async () => {
    try {
      const res = await fetch("/api/rumah");
      if (!res.ok) throw new Error("Gagal memuat data survey");
      const json = await res.json();
      setSurveys(json);
    } catch {
      toast({ title: "❌ Gagal memuat data survey" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSurveys();
  }, []);

  // Validasi
  const validateForm = () => {
    if (!form.kodeSurvey || !form.alamat || !form.desaId || !form.kecamatanId) {
      toast({ title: "⚠️ Semua field utama wajib diisi" });
      return false;
    }
    return true;
  };

  // Submit (Tambah)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const body = {
        ...form,
        desaId: Number(form.desaId),
        kecamatanId: Number(form.kecamatanId),
        pemilik: form.pemilik,
        noKK: form.noKK,
        luasBangunan: form.luasBangunan ? Number(form.luasBangunan) : null,
        koordinatLat: form.koordinatLat ? Number(form.koordinatLat) : null,
        koordinatLng: form.koordinatLng ? Number(form.koordinatLng) : null,
        jumlahPenghuni: form.jumlahPenghuni ? Number(form.jumlahPenghuni) : 0,
        prioritas: Number(form.prioritas),
        createdById: Number(form.createdById),
      };

      const res = await fetch("/api/rumah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah survey");

      toast({ title: "✅ Survey berhasil ditambahkan" });
      setOpen(false);
      resetForm();
      fetchSurveys();
    } catch (err: any) {
      toast({ title: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Export Excel
  const exportToExcel = () => {
    const dataToExport = surveys.map((s) => ({
      Kode: s.kodeSurvey,
      Alamat: s.alamat,
      Kecamatan: s.kecamatan?.namakecamatan || "",
      Desa: s.desa?.namadesa || "",
      "Kondisi Atap": s.kondisiAtap,
      "Kondisi Dinding": s.kondisiDinding,
      "Kondisi Lantai": s.kondisiLantai,
      Sanitasi: s.sanitasi,
      "Jumlah Penghuni": s.jumlahPenghuni,
      Prioritas: s.prioritas,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Survey");
    XLSX.writeFile(workbook, "Data_Survey_RTLH.xlsx");
  };

  // Export PDF (fix autoTable import usage)
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Data Survey RTLH", 14, 15);
    const tableColumn = [
      "Kode",
      "Alamat",
      "Kecamatan",
      "Desa",
      "Kondisi Atap",
      "Kondisi Dinding",
      "Kondisi Lantai",
      "Sanitasi",
      "Jml Penghuni",
      "Prioritas",
    ];
    const tableRows = surveys.map((s) => [
      s.kodeSurvey,
      s.alamat,
      s.kecamatan?.namakecamatan || "",
      s.desa?.namadesa || "",
      s.kondisiAtap || "-",
      s.kondisiDinding || "-",
      s.kondisiLantai || "-",
      s.sanitasi || "-",
      s.jumlahPenghuni ?? 0,
      s.prioritas,
    ]);
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("Data_Survey_RTLH.pdf");
  };

  // Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id) return toast({ title: "❌ ID tidak ditemukan" });

    setSubmitting(true);
    try {
      const body = {
        ...form,
        desaId: Number(form.desaId),
        kecamatanId: Number(form.kecamatanId),
        pemilik: form.pemilik,
        noKK: form.noKK,
        luasBangunan: form.luasBangunan ? Number(form.luasBangunan) : null,
        koordinatLat: form.koordinatLat ? Number(form.koordinatLat) : null,
        koordinatLng: form.koordinatLng ? Number(form.koordinatLng) : null,
        jumlahPenghuni: form.jumlahPenghuni ? Number(form.jumlahPenghuni) : 0,
        sumberAir: form.sumberAir,
        sanitasi: form.sanitasi,
        prioritas: Number(form.prioritas),
        createdById: Number(form.createdById),
      };

      const res = await fetch(`/api/rumah/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui survey");

      toast({ title: "✅ Data berhasil diperbarui" });
      setEditOpen(false);
      fetchSurveys();
    } catch (err: any) {
      toast({ title: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      const res = await fetch(`/api/rumah/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus data");

      toast({ title: "🗑️ Data berhasil dihapus" });
      setSurveys((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      toast({ title: err.message });
    }
  };

  // Filtered & Pagination
  const filteredSurveys = surveys.filter((s) => {
    const matchKec = filterKecamatan
      ? s.kecamatan?.namakecamatan
          ?.toLowerCase()
          .includes(filterKecamatan.toLowerCase())
      : true;
    const matchDesa = filterDesa
      ? s.desa?.namadesa?.toLowerCase().includes(filterDesa.toLowerCase())
      : true;
    return matchKec && matchDesa;
  });

  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSurveys = filteredSurveys.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Memuat...
      </div>
    );

  // -------------------
  // MapPicker component (inline in same file)
  // -------------------
 

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="rumah"
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
            <h2 className="text-xl font-bold">📋 Data Survey RTLH</h2>

            <Dialog open={open} onOpenChange={setOpen}>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <DialogTrigger asChild>
                  <Button
                    disabled={submitting}
                    onClick={() => resetForm()}
                    className="font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    aria-label="Tambah Survey"
                  >
                    + Tambah Survey
                  </Button>
                </DialogTrigger>
                <Button onClick={exportToExcel} className="bg-green-600 hover:bg-blue-700 text-white">
                  📘 Export Excel
                </Button>
              </div>

              <DialogContent className="sm:max-w-screen-lg w-full rounded-xl shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="border-b px-6 py-4 bg-gray-50">
                  <DialogTitle className="text-xl font-semibold text-gray-800">
                    Tambah Survey Baru
                  </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[75vh] px-6 py-4">
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Form tambah survey">
                    {/* Informasi Umum */}
                    <Card className="col-span-full p-4 border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-700 mb-3">📋 Informasi Umum</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField id="kodeSurvey" label="Kode Survey" value={form.kodeSurvey} onChange={(e) => setForm({ ...form, kodeSurvey: e.target.value })} required />
                        <InputField id="alamat" label="Alamat" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} required />

                        <div>
                          <label htmlFor="kecamatanId" className="text-sm font-medium text-gray-600">Kecamatan</label>
                          <select id="kecamatanId" value={form.kecamatanId} onChange={(e) => setForm({ ...form, kecamatanId: e.target.value, desaId: "" })} required className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Pilih Kecamatan</option>
                            {kecamatanList.map((k: any) => (
                              <option key={k.kecamatanId} value={k.kecamatanId}>{k.namakecamatan}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="desaId" className="text-sm font-medium text-gray-600">Desa</label>
                          <select id="desaId" value={form.desaId} onChange={(e) => setForm({ ...form, desaId: e.target.value })} required className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Pilih Desa</option>
                            {desaList.filter((d: any) => Number(d.kecamatanId) === Number(form.kecamatanId)).map((d: any) => (
                              <option key={d.desaId} value={d.desaId}>{d.namadesa}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </Card>

                    {/* Identitas Pemilik */}
                    <Card className="col-span-full p-4 border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-700 mb-3">👤 Identitas Pemilik</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField id="pemilik" label="Pemilik" value={form.pemilik} onChange={(e) => setForm({ ...form, pemilik: e.target.value })} />
                        <InputField id="noKK" label="No KK" value={form.noKK} onChange={(e) => setForm({ ...form, noKK: e.target.value })} />
                      </div>
                    </Card>

                    {/* Kondisi Rumah + Map */}
                    <Card className="col-span-full p-4 border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-700 mb-3">🏠 Kondisi Rumah & Lokasi</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField id="luasBangunan" label="Luas Bangunan (m²)" type="number" inputMode="numeric" value={form.luasBangunan} onChange={(e) => setForm({ ...form, luasBangunan: e.target.value })} />

                        {/* Latitude & Longitude (editable, but also filled by map) */}
                       
                        <div>
                          <label htmlFor="kondisiAtap" className="text-sm font-medium text-gray-600">Kondisi Atap</label>
                          <select id="kondisiAtap" value={form.kondisiAtap} onChange={(e) => setForm({ ...form, kondisiAtap: e.target.value })} className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Pilih Kondisi</option>
                            <option value="Baik">Baik</option>
                            <option value="Rusak Ringan">Rusak Ringan</option>
                            <option value="Rusak Berat">Rusak Berat</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="kondisiDinding" className="text-sm font-medium text-gray-600">Kondisi Dinding</label>
                          <select id="kondisiDinding" value={form.kondisiDinding} onChange={(e) => setForm({ ...form, kondisiDinding: e.target.value })} className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Pilih Kondisi</option>
                            <option value="Baik">Baik</option>
                            <option value="Rusak Ringan">Rusak Ringan</option>
                            <option value="Rusak Berat">Rusak Berat</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="kondisiLantai" className="text-sm font-medium text-gray-600">Kondisi Lantai</label>
                          <select id="kondisiLantai" value={form.kondisiLantai} onChange={(e) => setForm({ ...form, kondisiLantai: e.target.value })} className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Pilih Kondisi</option>
                            <option value="Layak">Layak</option>
                            <option value="Tidak Layak">Tidak Layak</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="sumberAir" className="text-sm font-medium text-gray-600">Sumber Air Bersih</label>
                          <select id="sumberAir" value={form.sumberAir} onChange={(e) => setForm({ ...form, sumberAir: e.target.value })} className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Pilih</option>
                            <option value="Sumur">Sumur</option>
                            <option value="PAM">PAM</option>
                            <option value="Sungai">Sungai</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="sanitasi" className="text-sm font-medium text-gray-600">Sanitasi</label>
                          <select id="sanitasi" value={form.sanitasi} onChange={(e) => setForm({ ...form, sanitasi: e.target.value })} className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Pilih</option>
                            <option value="Ada">Ada</option>
                            <option value="Tidak Ada">Tidak Ada</option>
                          </select>
                        </div>

                        <InputField id="jumlahPenghuni" label="Jumlah Penghuni" type="number" inputMode="numeric" value={form.jumlahPenghuni} onChange={(e) => setForm({ ...form, jumlahPenghuni: e.target.value })} />
                        <InputField id="prioritas" label="Prioritas (1-3)" type="number" inputMode="numeric" value={form.prioritas} onChange={(e) => setForm({ ...form, prioritas: e.target.value })} />
                      </div>

                      {/* Map picker row (span full) */}
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Klik pada peta untuk memilih lokasi rumah. Koordinat akan terisi otomatis.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputField id="editLat" label="Koordinat Latitude" value={form.koordinatLat} onChange={(e) => setForm({ ...form, koordinatLat: e.target.value })} />
                      <InputField id="editLng" label="Koordinat Longitude" value={form.koordinatLng} onChange={(e) => setForm({ ...form, koordinatLng: e.target.value })} />
                      </div>
                       <MapPicker
                        lat={form.koordinatLat ? Number(form.koordinatLat) : null}
                        lng={form.koordinatLng ? Number(form.koordinatLng) : null}
                        onChange={(lat, lng) => setForm({ ...form, koordinatLat: String(lat), koordinatLng: String(lng) })}
                      />
                        {form.koordinatLat && form.koordinatLng && (
                          <p className="text-sm text-gray-500 mt-2">
                            📍 Koordinat: {Number(form.koordinatLat).toFixed(6)}, {Number(form.koordinatLng).toFixed(6)}
                          </p>
                        )}
                      </div>
                    </Card>

                    <Separator className="col-span-full" />

                    <div className="col-span-full flex justify-end pt-2">
                      <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 shadow-sm" aria-label="Simpan Survey">
                        {submitting ? "Menyimpan..." : "💾 Simpan"}
                      </Button>
                    </div>
                  </form>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filter */}
          <div className="flex gap-3 bg-white p-4 rounded-lg shadow items-center">
            <Input placeholder="Cari Kecamatan..." value={filterKecamatan} onChange={(e) => { setFilterKecamatan(e.target.value); setCurrentPage(1); }} className="max-w-xs" />
            <Input placeholder="Cari Desa..." value={filterDesa} onChange={(e) => { setFilterDesa(e.target.value); setCurrentPage(1); }} className="max-w-xs" />
            <Button variant="secondary" onClick={() => { setFilterKecamatan(""); setFilterDesa(""); }}>Reset</Button>
          </div>

          {/* Table */}
          <div className="bg-white p-5 rounded-xl shadow">
            {loading ? <p>Loading...</p> : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">No</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Pemilik Rumah</TableHead>
                      <TableHead>Alamat</TableHead>
                      <TableHead>Desa/Kelurahan</TableHead>
                      <TableHead>Kecamatan</TableHead>
                      <TableHead>Kordinat</TableHead>
                      <TableHead>Atap</TableHead>
                      <TableHead>Dinding</TableHead>
                      <TableHead>Lantai</TableHead>
                      <TableHead>Sanitasi</TableHead>
                      <TableHead>Jumlah Penghuni</TableHead>
                      <TableHead>Prioritas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Datecreate</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSurveys.map((s, index) => (
                      <TableRow key={s.id}>
                         <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell>{s.kodeSurvey}</TableCell>
                        <TableCell>{s.pemilik}</TableCell>
                        <TableCell>{s.alamat}</TableCell>
                        <TableCell>{s.desa?.namadesa}</TableCell>
                        <TableCell>{s.kecamatan?.namakecamatan}</TableCell>
                        <TableCell
                          className="p-3 text-blue-600 underline cursor-pointer"
                          onClick={() => {
                            setSelectedLatLng({
                              lat: s.koordinatLat ?? 0,
                              lng: s.koordinatLng ?? 0,
                            });
                            setMapModal(true);
                          }}
                        >
                          Lihat Lokasi
                        </TableCell>
                        <TableCell>{s.kondisiAtap}</TableCell>
                        <TableCell>{s.kondisiDinding}</TableCell>
                        <TableCell>{s.kondisiLantai}</TableCell>
                        <TableCell>{s.sanitasi}</TableCell>
                        <TableCell>{s.jumlahPenghuni}</TableCell>
                        <TableCell className="p-3">
                          <span
                            className={`
                              px-2 py-1 rounded-full text-xs font-semibold
                              ${s.prioritas === 1 && "bg-red-100 text-red-600"}
                              ${s.prioritas === 2 && "bg-yellow-100 text-yellow-600"}
                              ${s.prioritas === 3 && "bg-green-100 text-green-600"}
                            `}
                          >
                            {s.prioritas === 1 && "Tinggi"}
                            {s.prioritas === 2 && "Sedang"}
                            {s.prioritas === 3 && "Rendah"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold
                              ${s.status === "APPROVED" && "bg-green-100 text-green-700"}
                              ${s.status === "REJECTED" && "bg-red-100 text-red-700"}
                              ${s.status === "PENDING" && "bg-gray-100 text-gray-700"}
                              `}>
                              {s.status}
                          </span>
                        </TableCell>
                        <TableCell>{s.updatedAt}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                            setForm({
                              id: String(s.id),
                              kodeSurvey: s.kodeSurvey,
                              alamat: s.alamat,
                              desaId: String(s.desaId),
                              kecamatanId: String(s.kecamatanId),
                              pemilik: s.pemilik ?? "",
                              noKK: s.noKK ?? "",
                              luasBangunan: String(s.luasBangunan ?? ""),
                              koordinatLat: s.koordinatLat != null ? String(s.koordinatLat) : "",
                              koordinatLng: s.koordinatLng != null ? String(s.koordinatLng) : "",
                              kondisiAtap: s.kondisiAtap ?? "",
                              kondisiDinding: s.kondisiDinding ?? "",
                              kondisiLantai: s.kondisiLantai ?? "",
                              sumberAir: s.sumberAir ?? "",
                              sanitasi: s.sanitasi ?? "",
                              jumlahPenghuni: String(s.jumlahPenghuni ?? ""),
                              prioritas: String(s.prioritas),
                              createdById: String(user?.id ?? ""),
                              status: s.status ?? "",
                            });
                            setEditOpen(true);
                          }}>✏️ Detail</Button>
                         <Button
                            size="sm"
                            variant="destructive"
                            onClick={s.status !== "APPROVED" ? () => handleDelete(s.id) : undefined}
                            disabled={s.status === "APPROVED"}
                          >
                            🗑️ Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-500">Menampilkan {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredSurveys.length)} dari {filteredSurveys.length} data</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>‹ Sebelumnya</Button>
                      <span className="text-sm text-gray-700">Halaman {currentPage} dari {totalPages}</span>
                      <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Selanjutnya ›</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* EDIT DIALOG */}
          {/* MAP MODAL */}
          <Dialog open={mapModal} onOpenChange={setMapModal}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Lokasi Survey</DialogTitle>
              </DialogHeader>
              <iframe
                className="w-full h-[450px] rounded-xl"
                src={`https://www.google.com/maps?q=${selectedLatLng.lat},${selectedLatLng.lng}&z=16&output=embed`}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-screen-lg w-full rounded-xl shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="border-b px-6 py-4 bg-gray-50">
                <DialogTitle className="text-xl font-semibold text-gray-800">Edit Data Survey</DialogTitle>
              </DialogHeader>

              <ScrollArea className="max-h-[75vh] px-6 py-4">
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Informasi Umum */}
                  <Card className="col-span-full p-4 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-3">📋 Informasi Umum</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField id="editKodeSurvey" label="Kode Survey" value={form.kodeSurvey} onChange={(e) => setForm({ ...form, kodeSurvey: e.target.value })} required />
                      <InputField id="editAlamat" label="Alamat" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} required />

                      <div>
                        <label htmlFor="editKecamatanId" className="text-sm font-medium text-gray-600">Kecamatan</label>
                        <select id="editKecamatanId" value={form.kecamatanId} onChange={(e) => setForm({ ...form, kecamatanId: e.target.value, desaId: "" })} required className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Pilih Kecamatan</option>
                          {kecamatanList.map((k: any) => (<option key={k.kecamatanId} value={k.kecamatanId}>{k.namakecamatan}</option>))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="editDesaId" className="text-sm font-medium text-gray-600">Desa</label>
                        <select id="editDesaId" value={form.desaId} onChange={(e) => setForm({ ...form, desaId: e.target.value })} required className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Pilih Desa</option>
                          {desaList.filter((d: any) => Number(d.kecamatanId) === Number(form.kecamatanId)).map((d: any) => (<option key={d.desaId} value={d.desaId}>{d.namadesa}</option>))}
                        </select>
                      </div>
                    </div>
                  </Card>

                  {/* Identitas */}
                  <Card className="col-span-full p-4 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-3">👤 Identitas Pemilik</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField id="editPemilik" label="Pemilik" value={form.pemilik} onChange={(e) => setForm({ ...form, pemilik: e.target.value })} />
                      <InputField id="editNoKK" label="No KK" value={form.noKK} onChange={(e) => setForm({ ...form, noKK: e.target.value })} />
                    </div>
                  </Card>

                  {/* Kondisi + Map for edit */}
                  <Card className="col-span-full p-4 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-3">🏠 Kondisi Rumah & Lokasi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputField id="editLuas" label="Luas Bangunan (m²)" type="number" inputMode="numeric" value={form.luasBangunan} onChange={(e) => setForm({ ...form, luasBangunan: e.target.value })} />
                     

                      <div>
                        <label htmlFor="kondisiAtap" className="text-sm font-medium text-gray-600">Kondisi Atap</label>
                        <select id="kondisiAtap" value={form.kondisiAtap} onChange={(e) => setForm({ ...form, kondisiAtap: e.target.value })} className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Pilih Kondisi</option>
                          <option value="Baik">Baik</option>
                          <option value="Rusak Ringan">Rusak Ringan</option>
                          <option value="Rusak Berat">Rusak Berat</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="kondisiDinding" className="text-sm font-medium text-gray-600">Kondisi Dinding</label>
                        <select id="kondisiDinding" value={form.kondisiDinding} onChange={(e) => setForm({ ...form, kondisiDinding: e.target.value })} className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Pilih Kondisi</option>
                          <option value="Baik">Baik</option>
                          <option value="Rusak Ringan">Rusak Ringan</option>
                          <option value="Rusak Berat">Rusak Berat</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="kondisiLantai" className="text-sm font-medium text-gray-600">Kondisi Lantai</label>
                        <select id="kondisiLantai" value={form.kondisiLantai} onChange={(e) => setForm({ ...form, kondisiLantai: e.target.value })} className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Pilih Kondisi</option>
                          <option value="Layak">Layak</option>
                          <option value="Tidak Layak">Tidak Layak</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="sumberAir" className="text-sm font-medium text-gray-600">Sumber Air Bersih</label>
                        <select id="sumberAir" value={form.sumberAir} onChange={(e) => setForm({ ...form, sumberAir: e.target.value })} className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Pilih</option>
                          <option value="Sumur">Sumur</option>
                          <option value="PAM">PAM</option>
                          <option value="Sungai">Sungai</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="sanitasi" className="text-sm font-medium text-gray-600">Sanitasi</label>
                        <select id="sanitasi" value={form.sanitasi} onChange={(e) => setForm({ ...form, sanitasi: e.target.value })} className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Pilih</option>
                          <option value="Ada">Ada</option>
                          <option value="Tidak Ada">Tidak Ada</option>
                        </select>
                      </div>

                      <InputField id="editJumlah" label="Jumlah Penghuni" type="number" inputMode="numeric" value={form.jumlahPenghuni} onChange={(e) => setForm({ ...form, jumlahPenghuni: e.target.value })} />
                      <InputField id="editPrioritas" label="Prioritas (1-3)" type="number" inputMode="numeric" value={form.prioritas} onChange={(e) => setForm({ ...form, prioritas: e.target.value })} />
                      
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Klik pada peta untuk memilih lokasi rumah. Koordinat akan terisi otomatis.</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputField id="editLat" label="Koordinat Latitude" value={form.koordinatLat} onChange={(e) => setForm({ ...form, koordinatLat: e.target.value })} />
                      <InputField id="editLng" label="Koordinat Longitude" value={form.koordinatLng} onChange={(e) => setForm({ ...form, koordinatLng: e.target.value })} />
                      </div>
                      <MapPicker
                        lat={form.koordinatLat ? Number(form.koordinatLat) : null}
                        lng={form.koordinatLng ? Number(form.koordinatLng) : null}
                        onChange={(lat, lng) => setForm({ ...form, koordinatLat: String(lat), koordinatLng: String(lng) })}
                      />
                      {form.koordinatLat && form.koordinatLng && (
                        <p className="text-sm text-gray-500 mt-2">📍 Koordinat: {Number(form.koordinatLat).toFixed(6)}, {Number(form.koordinatLng).toFixed(6)}</p>
                      )}
                    </div>

                  </Card>

                  <Separator className="col-span-full" />

                  <div className="col-span-full flex justify-end pt-2">
                   <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={form.status === "APPROVED" || submitting}
                    >
                      {submitting ? "Memperbarui..." : "💾 Update"}
                    </Button>
                  </div>
                </form>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}

/* Reusable InputField component — typed */
type InputFieldProps = {
  id?: string;
  label: string;
  type?: string;
  value: any;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  required?: boolean;
  inputMode?: "numeric" | "text" | "decimal" | undefined;
};

function InputField({ id, label, type = "text", value, onChange, required = false, inputMode }: InputFieldProps) {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-600">{label}</label>
      <Input
        id={id}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        placeholder={label}
        inputMode={inputMode}
        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
