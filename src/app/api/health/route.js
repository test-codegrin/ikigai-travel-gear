import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
