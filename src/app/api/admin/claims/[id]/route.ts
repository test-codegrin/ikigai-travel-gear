import { NextRequest, NextResponse } from "next/server";
import { selectQuery } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

interface ClaimDetail extends RowDataPacket {
  id: number;
  warranty_id: number;
  claim_external_id: string;
  claim_result_date: string | null;
  photo_url: string;
  video_url: string | null;
  defect_description: string;
  claim_status_id: number;
  admin_notes: string | null;
  claim_register_date: string;
  claim_status_name: string;
  warranty_external_id: string;
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
  warranty_status_name: string;
  warranty_registration_date: string;
}

interface ClaimStatus extends RowDataPacket {
  id: number;
  name: string;
  description: string;
}

interface ClaimStatusHistory extends RowDataPacket {
  id: number;
  claim_id: number;
  status_name: string;
  changed_by: string | null;
  admin_notes: string | null;
  changed_at: string;
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
    const claimId = id;

    // Fetch claim detail with warranty and status information
    const claim = await selectQuery<ClaimDetail>(
      `SELECT 
        c.*,
        cs.name as claim_status_name,
        w.external_id as warranty_external_id,
        w.customer_name,
        w.customer_email,
        w.customer_mobile,
        w.customer_address,
        w.customer_city,
        w.customer_pincode,
        w.purchase_date,
        w.purchase_price,
        w.purchase_from,
        w.invoice_file_url,
        w.warranty_card_file_url,
        w.registration_date as warranty_registration_date,
        ws.name as warranty_status_name
      FROM claims c
      LEFT JOIN claim_statuses cs ON c.claim_status_id = cs.id
      LEFT JOIN warranties w ON c.warranty_id = w.id
      LEFT JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
      WHERE c.claim_external_id = ? AND c.is_deleted = 0`,
      [claimId]
    );

    if (!claim || claim.length === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Fetch all available claim statuses
    const statuses = await selectQuery<ClaimStatus>(
      `SELECT id, name, description 
       FROM claim_statuses 
       WHERE is_deleted = 0 
       ORDER BY id ASC`
    );

    // Fetch claim status history
    const history = await selectQuery<ClaimStatusHistory>(
      `SELECT 
        csh.id,
        csh.claim_id,
        cs.name as status_name,
        csh.changed_by,
        csh.admin_notes,
        csh.changed_at
      FROM claim_status_history csh
      JOIN claim_statuses cs ON csh.claim_status_id = cs.id
      WHERE csh.claim_id = ?
      ORDER BY csh.changed_at DESC`,
      [claim[0].id]
    );

    return NextResponse.json(
      {
        claim: claim[0],
        statuses: statuses,
        history: history,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get claim detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch claim details" },
      { status: 500 }
    );
  }
}
