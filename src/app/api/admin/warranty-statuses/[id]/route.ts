import { NextRequest, NextResponse } from "next/server";
import { selectQuery, mutationQuery } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

interface WarrantyStatus extends RowDataPacket {
  id: number;
  name: string;
}

// PUT - Update warranty status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookie();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Status name is required" },
        { status: 400 }
      );
    }

    // Check if status exists
    const existing = await selectQuery<WarrantyStatus>(
      `SELECT id FROM warranty_statuses WHERE id = ? AND is_deleted = FALSE`,
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Warranty status not found" },
        { status: 404 }
      );
    }

    // Check if new name conflicts with another status
    const duplicate = await selectQuery<WarrantyStatus>(
      `SELECT id FROM warranty_statuses 
       WHERE name = ? AND id != ? AND is_deleted = FALSE`,
      [name.toLowerCase().trim(), id]
    );

    if (duplicate.length > 0) {
      return NextResponse.json(
        { error: "Status name already exists" },
        { status: 400 }
      );
    }

    await mutationQuery(
      `UPDATE warranty_statuses 
       SET name = ?, description = ? 
       WHERE id = ?`,
      [name.toLowerCase().trim(), description || null, id]
    );

    return NextResponse.json(
      { message: "Warranty status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update warranty status error:", error);
    return NextResponse.json(
      { error: "Failed to update warranty status" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete warranty status
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookie();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if status exists
    const existing = await selectQuery<WarrantyStatus>(
      `SELECT id FROM warranty_statuses WHERE id = ? AND is_deleted = FALSE`,
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Warranty status not found" },
        { status: 404 }
      );
    }

    // Check if status is being used
    const inUse = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count FROM warranties WHERE warranty_status_id = ?`,
      [id]
    );

    if (inUse[0].count > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete status. It is currently used by ${inUse[0].count} warranties.` 
        },
        { status: 400 }
      );
    }

    await mutationQuery(
      `UPDATE warranty_statuses SET is_deleted = TRUE WHERE id = ?`,
      [id]
    );

    return NextResponse.json(
      { message: "Warranty status deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete warranty status error:", error);
    return NextResponse.json(
      { error: "Failed to delete warranty status" },
      { status: 500 }
    );
  }
}
