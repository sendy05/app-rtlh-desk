import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "rahasia-super-aman";

export async function GET(req: Request) {
  try {
    // 🔑 Ambil token dari cookie
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];

    if (!token) {
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 401 });
    }

    // 🧩 Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
    };

    // 🧩 Ambil user dari database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // 🧾 Kirim data user ke frontend
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        nip: user.nip,
        email: user.email,
        jabatan: user.jabatan,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error di /api/me:", error);
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }
}
