import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const idNumber = Number(id);

    if (!idNumber || isNaN(idNumber) || idNumber <= 0) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { status, verifikatorId } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    if (!verifikatorId || isNaN(verifikatorId)) {
      return NextResponse.json({ error: "Verifikator ID tidak valid" }, { status: 400 });
    }

    const data = await prisma.survey.update({
      where: { id: idNumber },
      data: {
        status,
        verifikatorId:Number(verifikatorId),
      },
    });

    return NextResponse.json({ message: "Status berhasil diperbarui", data });
  } catch (err) {
    console.error("PUT /verifikasi error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
