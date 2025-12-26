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
  customer_address: string;
  customer_city: string;
  customer_pincode: string;
  purchase_date: string;
  purchase_price: string;
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

    // Fetch all warranties with statistics
    const warranties = await selectQuery<WarrantyRow>(
      `SELECT 
        w.*,
        ws.name as status_name
      FROM warranties w
      JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
      WHERE w.is_deleted = FALSE
      ORDER BY w.registration_date DESC
      LIMIT 10`
    );

    // Calculate statistics
    const totalWarranties = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM warranties 
       WHERE is_deleted = FALSE`
    );

    const activeWarranties = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM warranties w
       JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
       WHERE w.is_deleted = FALSE AND ws.name = 'registered'`
    );

    const thisMonthWarranties = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM warranties 
       WHERE is_deleted = FALSE 
       AND YEAR(registration_date) = YEAR(CURRENT_DATE())
       AND MONTH(registration_date) = MONTH(CURRENT_DATE())`
    );

    return NextResponse.json({ 
      warranties,
      stats: {
        total: totalWarranties[0]?.count || 0,
        active: activeWarranties[0]?.count || 0,
        claimed: 0,
        thisMonth: thisMonthWarranties[0]?.count || 0
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Get warranties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch warranties" },
      { status: 500 }
    );
  }
}
