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
import { useRouter } from "next/navigation";

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
  const [role, setRole] = useState<User | null>(null);

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
        if (data.user.role !== "VERIFIER" && data.user.role !== "ADMIN") {
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

    const handleApprove = async (id: number) => {
    await updateStatus(id, "APPROVED");
    };

    const handleReject = async (id: number) => {
    await updateStatus(id, "REJECTED");
    };

    const updateStatus = async (id: number, status: string) => {
    try {
      if (!String(user?.id ?? "")) {
        toast({ title: "User belum login" });
        return;
      }

      const res = await fetch(`/api/rumah/${id}/verifikasi`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          verifikatorId: String(user?.id ?? ""),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal update status");

      toast({ title: result.message });
      fetchSurveys();
    } catch (err: any) {
      toast({ title: "❌ " + err.message });
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
        active="verifikasi"
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
            <h2 className="text-xl font-bold">📋 Verifikasi Data RTLH</h2>

           
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
                      <TableHead>No</TableHead>
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
                            `}
                        >
                            {s.status}
                        </span>
                        </TableCell>
                        <TableCell>{s.updatedAt}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(s.id)}>✅ Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(s.id)}>❌ Reject</Button>
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
