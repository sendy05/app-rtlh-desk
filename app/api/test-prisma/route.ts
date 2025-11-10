import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";  // jika menggunakan Neon adapter

export const runtime = "nodejs"; // optional, default

// kalau pakai adapter Neon:
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    return NextResponse.json({ success: true, time: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
