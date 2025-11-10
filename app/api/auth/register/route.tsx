export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "rahasia-super-aman";


export async function GET() {
  const data = await prisma.user.findMany();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const { nip, name, email, password, jabatan, role } = await req.json();

    // 🧩 Validasi input
    if (!name || !email || !password || !nip || !jabatan || !role) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // 🧩 Cek apakah user sudah ada (by email atau nip)
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { nip }] },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email atau NIP sudah terdaftar" },
        { status: 400 }
      );
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 Simpan ke database
    const newUser = await prisma.user.create({
      data: {
        nip,
        name,
        email,
        password: hashedPassword,
        jabatan,
        role,
      },
    });

    // 🎟️ Generate JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        jabatan: newUser.jabatan,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🍪 Simpan token di cookie
    const response = NextResponse.json({
      message: "Registrasi berhasil",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        nip: newUser.nip,
        jabatan: newUser.jabatan,
        role: newUser.role,
      },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    return response;
  } catch (error) {
    console.error("❌ Error saat register:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
