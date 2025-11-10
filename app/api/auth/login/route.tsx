export const runtime = "nodejs"; // ⬅️ pastikan baris ini paling atas!

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "rahasia-super-aman";

export async function POST(req: Request) {
  try {
    const { nip, password } = await req.json();

    if (!nip || !password) {
      return NextResponse.json({ error: "NIP dan password wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { nip } });
    if (!user) {
      return NextResponse.json({ error: "NIP tidak ditemukan" }, { status: 404 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, nip: user.nip, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({
      message: "Login berhasil",
      user: { id: user.id, name: user.name, email: user.email, nip: user.nip, role: user.role },
    });

    // ✅ Simpan token di cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
