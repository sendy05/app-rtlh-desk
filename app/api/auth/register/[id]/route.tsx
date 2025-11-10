export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    console.log("🟢 PARAMS:", id);

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "ID user tidak valid" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, nip, jabatan, role, password } = body;

    if (!name || !email || !nip || !role) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    let dataToUpdate: any = { name, email, nip, jabatan, role };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("🔥 ERROR UPDATE USER:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const Id = Number(id);

    if (isNaN(Id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: Id } });
    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal menghapus user" },
      { status: 500 }
    );
  }
}
