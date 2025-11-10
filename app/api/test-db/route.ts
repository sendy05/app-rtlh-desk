import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection dengan simple query
    const result = await prisma.$queryRaw`SELECT NOW() as time`;

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      timestamp: result,
      database: "Neon PostgreSQL"
    });
  } catch (err: any) {
    console.error("Database connection error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Database connection failed",
      database: "Neon PostgreSQL"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
