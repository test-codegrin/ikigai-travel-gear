import { NextRequest, NextResponse } from "next/server";
import { selectQuery, mutationQuery } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

interface AdminProfile extends RowDataPacket {
  id: number;
  email: string;
  name: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// GET - Fetch admin profile
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminProfile = await selectQuery<AdminProfile>(
      `SELECT 
        id,
        email,
        name,
        is_active,
        created_at,
        updated_at
      FROM admins
      WHERE id = ? AND is_deleted = FALSE`,
      [admin.id]
    );

    if (!adminProfile || adminProfile.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        admin: {
          id: adminProfile[0].id,
          email: adminProfile[0].email,
          name: adminProfile[0].name,
          is_active: adminProfile[0].is_active === 1,
          created_at: adminProfile[0].created_at,
          updated_at: adminProfile[0].updated_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get admin profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    // Validate input
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Update admin profile (name only)
    const result = await mutationQuery(
      `UPDATE admins 
       SET name = ?, updated_at = NOW()
       WHERE id = ? AND is_deleted = FALSE`,
      [name.trim(), admin.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 404 }
      );
    }

    // Fetch updated profile
    const updatedProfile = await selectQuery<AdminProfile>(
      `SELECT 
        id,
        email,
        name,
        is_active,
        created_at,
        updated_at
      FROM admins
      WHERE id = ? AND is_deleted = FALSE`,
      [admin.id]
    );

    if (!updatedProfile || updatedProfile.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        admin: {
          id: updatedProfile[0].id,
          email: updatedProfile[0].email,
          name: updatedProfile[0].name,
          is_active: updatedProfile[0].is_active === 1,
          created_at: updatedProfile[0].created_at,
          updated_at: updatedProfile[0].updated_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update admin profile error:", error);
    return NextResponse.json(
      { error: "Failed to update admin profile" },
      { status: 500 }
    );
  }
}
