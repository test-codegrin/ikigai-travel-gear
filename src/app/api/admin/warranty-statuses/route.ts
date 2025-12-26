import { NextRequest, NextResponse } from "next/server";
import { selectQuery, mutationQuery } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

interface WarrantyStatus extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  is_deleted: number;
  created_at: string;
}

// GET - Fetch all warranty statuses
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const statuses = await selectQuery<WarrantyStatus>(
      `SELECT id, name, description, is_deleted, created_at 
       FROM warranty_statuses 
       WHERE is_deleted = FALSE 
       ORDER BY id ASC`
    );

    return NextResponse.json({ statuses }, { status: 200 });
  } catch (error) {
    console.error("Fetch warranty statuses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch warranty statuses" },
      { status: 500 }
    );
  }
}

// POST - Create new warranty status
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Status name is required" },
        { status: 400 }
      );
    }

    // Check if status name already exists
    const existing = await selectQuery<WarrantyStatus>(
      `SELECT id FROM warranty_statuses WHERE name = ? AND is_deleted = FALSE`,
      [name.toLowerCase().trim()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Status name already exists" },
        { status: 400 }
      );
    }

    await mutationQuery(
      `INSERT INTO warranty_statuses (name, description) VALUES (?, ?)`,
      [name.toLowerCase().trim(), description || null]
    );

    return NextResponse.json(
      { message: "Warranty status created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create warranty status error:", error);
    return NextResponse.json(
      { error: "Failed to create warranty status" },
      { status: 500 }
    );
  }
}
