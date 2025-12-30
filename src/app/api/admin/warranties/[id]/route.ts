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

interface ClaimInfo extends RowDataPacket {
  id: number;
  claim_external_id: string;
  claim_status_id: number;
  claim_status_name: string;
  claim_register_date: string;
  claim_result_date: string | null;
  defect_description: string;
  admin_notes: string | null;
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

    // Fetch warranty detail with status name (without claims)
    const warranty = await selectQuery<WarrantyDetail>(
      `SELECT 
        w.*,
        ws.name as status_name
      FROM warranties w
      LEFT JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
      WHERE w.external_id = ? AND w.is_deleted = 0
      LIMIT 1`,
      [warrantyId]
    );

    if (!warranty || warranty.length === 0) {
      return NextResponse.json(
        { error: "Warranty not found" },
        { status: 404 }
      );
    }

    // Fetch all claims associated with this warranty
    const claims = await selectQuery<ClaimInfo>(
      `SELECT 
        c.id,
        c.claim_external_id,
        c.claim_status_id,
        cs.name as claim_status_name,
        c.claim_register_date,
        c.claim_result_date,
        c.defect_description,
        c.admin_notes
      FROM claims c
      LEFT JOIN claim_statuses cs ON c.claim_status_id = cs.id
      WHERE c.warranty_id = ? AND c.is_deleted = 0
      ORDER BY c.claim_register_date DESC`,
      [warranty[0].id]
    );

    // Fetch all available warranty statuses
    const statuses = await selectQuery<WarrantyStatus>(
      `SELECT id, name FROM warranty_statuses WHERE is_deleted = 0 ORDER BY id`
    );

    return NextResponse.json(
      {
        warranty: warranty[0],
        claims: claims,
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
