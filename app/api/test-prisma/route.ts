import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;

    return NextResponse.json({
      success: true,
      message: "Prisma connection successful",
      data: result
    });
  } catch (error: any) {
    console.error("Prisma connection error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Prisma connection failed"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
