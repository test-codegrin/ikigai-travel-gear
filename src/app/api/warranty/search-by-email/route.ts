import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // Your MySQL connection

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Query warranties by email
    const [warranties] = await db.query(
      `SELECT 
        w.id,
        w.external_id,
        w.customer_name,
        w.customer_email,
        w.purchase_date,
        w.purchase_price,
        w.purchase_from,
        w.warranty_status_id,
        ws.name as warranty_status_name
      FROM warranties w
      LEFT JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
      WHERE w.customer_email = ? 
        AND w.is_deleted = 0
      ORDER BY w.registration_date DESC`,
      [email]
    );

    if (!warranties || Array.isArray(warranties) && warranties.length === 0) {
      return NextResponse.json(
        { error: "No warranties found for this email" },
        { status: 404 }
      );
    }

    return NextResponse.json({ warranties });
  } catch (error) {
    console.error("Error searching warranties by email:", error);
    return NextResponse.json(
      { error: "Failed to search warranties" },
      { status: 500 }
    );
  }
}
