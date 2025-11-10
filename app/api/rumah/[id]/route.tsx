import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ DELETE
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const rumahId = Number(id);

  if (isNaN(rumahId)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  await prisma.survey.delete({ where: { id: rumahId } });
  return NextResponse.json({ message: "Berhasil dihapus" });
}

// ✅ UPDATE (PUT)
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const rumahId = Number(id);

  if (isNaN(rumahId)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const body = await req.json();

  try {
    const updateRumah = await prisma.survey.update({
      where: { id: rumahId },
      data: {
        kodeSurvey: body.kodeSurvey,
        alamat: body.alamat,
        desaId: body.desaId,
        kecamatanId: body.kecamatanId,
        pemilik: body.pemilik,
        noKK: body.noKK,
        luasBangunan: body.luasBangunan,
        koordinatLat: body.koordinatLat,
        koordinatLng: body.koordinatLng,
        kondisiAtap: body.kondisiAtap,
        kondisiDinding: body.kondisiDinding,
        kondisiLantai: body.kondisiLantai,
        sumberAir: body.sumberAir,
        sanitasi: body.sanitasi,
        jumlahPenghuni: body.jumlahPenghuni,
        prioritas: body.prioritas,
      },
    });

    return NextResponse.json(updateRumah);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal update data", details: String(error) },
      { status: 500 }
    );
  }
}
