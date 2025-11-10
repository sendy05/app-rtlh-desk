// src/lib/auth.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia";

export function getUserFromRequest(req: Request | NextRequest): any | null {
  try {
    // Cek header Authorization: Bearer <token>
    const authHeader = req.headers.get("authorization");
    const token =
      authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // { id, email, name, ... }
  } catch (error) {
    console.error("JWT Error:", error);
    return null;
  }
}
