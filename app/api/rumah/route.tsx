export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const surveys = await prisma.survey.findMany({
      include: {
        desa: { select: { namadesa: true } },
        kecamatan: { select: { namakecamatan: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        photos: true
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(surveys);
  } catch (error: any) {
    console.error("❌ Error GET surveys:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data survey", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      kodeSurvey,
      alamat,
      desaId,
      kecamatanId,
      pemilik,
      noKK,
      luasBangunan,
      koordinatLat,
      koordinatLng,
      kondisiAtap,
      kondisiDinding,
      kondisiLantai,
      sumberAir,
      sanitasi,
      jumlahPenghuni,
      prioritas = 3,
      createdById,
    } = body;

    // 🔍 Validasi field wajib
    if (!kodeSurvey || !alamat || !desaId || !kecamatanId || !createdById) {
      return NextResponse.json(
        { error: "Field wajib tidak boleh kosong" },
        { status: 400 }
      );
    }

    // 🧩 Pastikan angka dikonversi dari string (jika dikirim dari form)
    const desaIdNum = Number(desaId);
    const kecamatanIdNum = Number(kecamatanId);
    const createdByIdNum = Number(createdById);

    // 📥 Simpan data ke database
    const survey = await prisma.survey.create({
      data: {
        kodeSurvey,
        alamat,
        desaId: desaIdNum,
        kecamatanId: kecamatanIdNum,
        pemilik: pemilik,
        noKK: noKK,
        luasBangunan: luasBangunan ? Number(luasBangunan) : null,
        koordinatLat: koordinatLat ? Number(koordinatLat) : null,
        koordinatLng: koordinatLng ? Number(koordinatLng) : null,
        kondisiAtap,
        kondisiDinding,
        kondisiLantai,
        sumberAir,
        sanitasi,
        jumlahPenghuni: jumlahPenghuni ? Number(jumlahPenghuni) : null,
        prioritas: Number(prioritas),
        createdById: createdByIdNum,
      },
    });

    return NextResponse.json(
      { message: "Survey berhasil disimpan", survey },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error Prisma:", error);

    // 🌐 Tangani error unik Prisma (misal: kodeSurvey duplikat)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Kode survey sudah digunakan" },
        { status: 400 }
      );
    }

    // 🧱 Error umum
    return NextResponse.json(
      {
        error: "Terjadi kesalahan pada server",
        details:
          process.env.NODE_ENV === "development"
            ? error.message || error.toString()
            : undefined,
      },
      { status: 500 }
    );
  }
}
