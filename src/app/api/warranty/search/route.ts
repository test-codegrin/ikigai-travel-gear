import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const externalId = searchParams.get("external_id");

    if (!externalId) {
      return NextResponse.json(
        { error: "Warranty ID is required" },
        { status: 400 }
      );
    }

    // Fetch warranty details
    const warranties = (await query(
      `SELECT 
        w.*,
        ws.name as warranty_status_name
       FROM warranties w
       LEFT JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
       WHERE w.external_id = ? AND w.is_deleted = 0`,
      [externalId]
    )) as RowDataPacket[];

    if (!warranties || warranties.length === 0) {
      return NextResponse.json(
        { error: "Warranty not found" },
        { status: 404 }
      );
    }

    const warranty = warranties[0];

    // Check for existing claims
    const existingClaims = (await query(
      `SELECT 
        c.*,
        cs.name as claim_status
       FROM claims c
       LEFT JOIN claim_statuses cs ON c.claim_status_id = cs.id
       WHERE c.warranty_id = ? AND c.is_deleted = 0
       ORDER BY c.claim_register_date DESC
       LIMIT 1`,
      [warranty.id]
    )) as RowDataPacket[];

    const existingClaim =
      existingClaims && existingClaims.length > 0 ? existingClaims[0] : null;

    return NextResponse.json({
      warranty,
      existing_claim: existingClaim,
    });
  } catch (error) {
    console.error("Search warranty error:", error);
    return NextResponse.json(
      { error: "Failed to search warranty" },
      { status: 500 }
    );
  }
}
