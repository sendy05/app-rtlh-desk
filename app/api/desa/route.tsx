import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kecamatanId = Number(searchParams.get("kecamatanId"));
  const data = await prisma.desa.findMany({
    where: kecamatanId ? { kecamatanId } : undefined,
  });
  return NextResponse.json(data);
}
