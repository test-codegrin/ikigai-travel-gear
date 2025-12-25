import { NextRequest, NextResponse } from "next/server";
import { selectQuery } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

interface WarrantyRow extends RowDataPacket {
  id: number;
  external_id: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  purchase_date: string;
  product_description: string;
  serial_number: string;
  warranty_card_number: string;
  invoice_file_url: string;
  warranty_card_file_url: string;
  status_name: string;
  registration_date: string;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const warranties = await selectQuery<WarrantyRow>(
      `SELECT 
        w.*,
        ws.name as status_name
      FROM warranties w
      JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
      WHERE w.is_deleted = FALSE
      ORDER BY w.registration_date DESC`
    );

    return NextResponse.json({ warranties }, { status: 200 });
  } catch (error) {
    console.error("Get warranties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch warranties" },
      { status: 500 }
    );
  }
}
