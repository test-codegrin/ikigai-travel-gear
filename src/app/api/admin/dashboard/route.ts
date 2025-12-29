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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch recent warranties
    const warranties = await selectQuery<WarrantyRow>(
      `SELECT 
        w.*,
        ws.name as status_name
      FROM warranties w
      JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
      WHERE w.is_deleted = 0
      ORDER BY w.registration_date DESC
      LIMIT 10`
    );

    // Total warranties
    const totalWarranties = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count FROM warranties WHERE is_deleted = 0`
    );

    // Active warranties (registered status)
    const activeWarranties = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM warranties w
       JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
       WHERE w.is_deleted = 0 AND ws.name = 'registered'`
    );

    // Claimed warranties
    const claimedWarranties = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM warranties w
       JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
       WHERE w.is_deleted = 0 AND ws.name = 'claimed'`
    );

    // This month warranties
    const thisMonthWarranties = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM warranties 
       WHERE is_deleted = 0 
       AND YEAR(registration_date) = YEAR(CURRENT_DATE())
       AND MONTH(registration_date) = MONTH(CURRENT_DATE())`
    );

    // Last month warranties for comparison
    const lastMonthWarranties = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM warranties 
       WHERE is_deleted = 0 
       AND YEAR(registration_date) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
       AND MONTH(registration_date) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))`
    );

    // Total claims
    const totalClaims = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count FROM claims WHERE is_deleted = 0`
    );

    // Pending claims (under_review status)
    const pendingClaims = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM claims c
       JOIN claim_statuses cs ON c.claim_status_id = cs.id
       WHERE c.is_deleted = 0 AND cs.name = 'under_review'`
    );

    // Approved claims this month
    const approvedClaimsThisMonth = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM claims c
       JOIN claim_statuses cs ON c.claim_status_id = cs.id
       WHERE c.is_deleted = 0 
       AND cs.name = 'approved'
       AND YEAR(c.claim_register_date) = YEAR(CURRENT_DATE())
       AND MONTH(c.claim_register_date) = MONTH(CURRENT_DATE())`
    );

    // Calculate growth percentage
    const thisMonth = thisMonthWarranties[0]?.count || 0;
    const lastMonth = lastMonthWarranties[0]?.count || 0;
    const growthPercentage = lastMonth > 0 
      ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1)
      : 0;

    // Top cities (top 5)
    const topCities = await selectQuery<RowDataPacket>(
      `SELECT customer_city, COUNT(*) as count
       FROM warranties
       WHERE is_deleted = 0
       GROUP BY customer_city
       ORDER BY count DESC
       LIMIT 5`
    );

    // Recent claims (last 5)
    const recentClaims = await selectQuery<RowDataPacket>(
      `SELECT 
        c.claim_external_id,
        c.claim_register_date,
        cs.name as status_name,
        w.customer_name,
        w.external_id as warranty_id
       FROM claims c
       JOIN claim_statuses cs ON c.claim_status_id = cs.id
       JOIN warranties w ON c.warranty_id = w.id
       WHERE c.is_deleted = 0
       ORDER BY c.claim_register_date DESC
       LIMIT 5`
    );

    return NextResponse.json(
      {
        warranties,
        stats: {
          total: totalWarranties[0]?.count || 0,
          active: activeWarranties[0]?.count || 0,
          claimed: claimedWarranties[0]?.count || 0,
          thisMonth: thisMonth,
          growthPercentage: Number(growthPercentage),
          totalClaims: totalClaims[0]?.count || 0,
          pendingClaims: pendingClaims[0]?.count || 0,
          approvedClaimsThisMonth: approvedClaimsThisMonth[0]?.count || 0,
        },
        topCities,
        recentClaims,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get dashboard data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
