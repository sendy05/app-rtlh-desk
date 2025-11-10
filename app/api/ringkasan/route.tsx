export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Ambil total rumah
    const total = await prisma.survey.count();

    // Hitung rumah berdasarkan kondisi
    const tidakLayak = await prisma.survey.count({
      where: {
        OR: [
          { kondisiAtap: { contains: "Rusak Berat", mode: "insensitive" } },
          { kondisiDinding: { contains: "Rusak Berat", mode: "insensitive" } },
          { kondisiLantai: { contains: "Rusak Berat", mode: "insensitive" } },
        ],
      },
    });

    const layak = total - tidakLayak;

    // Hitung prioritas
    const prioritas1 = await prisma.survey.count({ where: { prioritas: 1 } });
    const prioritas2 = await prisma.survey.count({ where: { prioritas: 2 } });
    const prioritas3 = await prisma.survey.count({ where: { prioritas: 3 } });

    // Return ringkasan data
    return NextResponse.json({
      total,
      layak,
      tidakLayak,
      prioritas: {
        satu: prioritas1,
        dua: prioritas2,
        tiga: prioritas3,
      },
    });
  } catch (error) {
    console.error("Error mengambil ringkasan RTLH:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data ringkasan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
