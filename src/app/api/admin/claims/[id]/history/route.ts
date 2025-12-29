import { NextRequest, NextResponse } from "next/server";
import { selectQuery } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

interface ClaimStatusHistory extends RowDataPacket {
  id: number;
  claim_id: number;
  status_name: string;
  changed_by: string | null;
  admin_notes: string | null;
  changed_at: string;
}

interface ClaimInfo extends RowDataPacket {
  claim_external_id: string;
  warranty_external_id: string;
  customer_name: string;
  current_status: string;
  claim_register_date: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const claimExternalId = id;

    // Fetch claim info
    const claimInfo = await selectQuery<ClaimInfo>(
      `SELECT 
        c.claim_external_id,
        w.external_id as warranty_external_id,
        w.customer_name,
        cs.name as current_status,
        c.claim_register_date
      FROM claims c
      JOIN warranties w ON c.warranty_id = w.id
      JOIN claim_statuses cs ON c.claim_status_id = cs.id
      WHERE c.claim_external_id = ? AND c.is_deleted = 0`,
      [claimExternalId]
    );

    if (claimInfo.length === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Fetch status history
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
      JOIN claims c ON csh.claim_id = c.id
      WHERE c.claim_external_id = ?
      ORDER BY csh.changed_at DESC`,
      [claimExternalId]
    );

    return NextResponse.json(
      {
        claim: claimInfo[0],
        history: history,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get claim history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch claim history" },
      { status: 500 }
    );
  }
}
