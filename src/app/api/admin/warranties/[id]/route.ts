import { NextRequest, NextResponse } from "next/server";
import { selectQuery } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

interface WarrantyDetail extends RowDataPacket {
  id: number;
  external_id: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  customer_city: string;
  customer_pincode: number;
  purchase_date: string;
  purchase_price: number;
  purchase_from: string;
  invoice_file_url: string;
  warranty_card_file_url: string;
  warranty_status_id: number;
  status_name: string;
  registration_date: string;
  created_at: string;
}

interface WarrantyStatus extends RowDataPacket {
  id: number;
  name: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookie();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const warrantyId = id;

    // Fetch warranty detail with status name - FIXED: column is 'name' not 'status_name'
    const warranty = await selectQuery<WarrantyDetail>(
      `SELECT 
        w.*,
        ws.name as status_name
      FROM warranties w
      LEFT JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
      WHERE w.external_id = ? AND w.is_deleted = FALSE`,
      [warrantyId]
    );

    if (!warranty || warranty.length === 0) {
      return NextResponse.json(
        { error: "Warranty not found" },
        { status: 404 }
      );
    }

    // Fetch all available statuses
    const statuses = await selectQuery<WarrantyStatus>(
      `SELECT id, name FROM warranty_statuses WHERE is_deleted = FALSE ORDER BY id`
    );

    return NextResponse.json(
      {
        warranty: warranty[0],
        statuses: statuses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get warranty detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch warranty details" },
      { status: 500 }
    );
  }
}
