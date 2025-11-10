import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    const res = await pool.query("SELECT NOW()");
    return NextResponse.json({ 
      success: true, 
      dbUrl,
      time: res.rows[0] 
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      dbUrl: process.env.DATABASE_URL,
      error: err 
    });
  }
}
