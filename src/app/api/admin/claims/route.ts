import { NextRequest, NextResponse } from "next/server";
import { selectQuery } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

interface ClaimRow extends RowDataPacket {
  id: number;
  warranty_id: number;
  claim_external_id: string;
  warranty_external_id: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  customer_city: string;
  customer_pincode: number;
  defect_description: string;
  photo_url: string;
  video_url: string | null;
  claim_status_name: string;
  admin_notes: string | null;
  claim_register_date: string;
  claim_result_date: string | null;
  purchase_date: string;
  purchase_price: number;
  purchase_from: string;
}

// Type for SQL query parameters
type QueryParam = string | number | boolean | null;

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const purchaseFrom = searchParams.get("purchase_from") || "";
    const sortBy = searchParams.get("sort_by") || "claim_register_date";
    const sortOrder = searchParams.get("sort_order") || "DESC";
    const dateFrom = searchParams.get("date_from") || "";
    const dateTo = searchParams.get("date_to") || "";
    const minPrice = searchParams.get("min_price") || "";
    const maxPrice = searchParams.get("max_price") || "";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build WHERE clause with filters
    const whereConditions = ["c.is_deleted = 0"];
    const queryParams: QueryParam[] = [];

    // Search filter (claim_external_id, warranty_external_id, customer_name, customer_email, customer_mobile)
    if (search) {
      whereConditions.push(
        "(c.claim_external_id LIKE ? OR w.external_id LIKE ? OR w.customer_name LIKE ? OR w.customer_email LIKE ? OR w.customer_mobile LIKE ?)"
      );
      const searchPattern = `%${search}%`;
      queryParams.push(
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern
      );
    }

    // Status filter
    if (status && status.trim()) {
      whereConditions.push("cs.name = ?");
      queryParams.push(status);
    }

    // Purchase from filter
    if (purchaseFrom && purchaseFrom.trim()) {
      whereConditions.push("w.purchase_from = ?");
      queryParams.push(purchaseFrom);
    }

    // Date range filter (claim registration date)
    if (dateFrom) {
      whereConditions.push("DATE(c.claim_register_date) >= ?");
      queryParams.push(dateFrom);
    }
    if (dateTo) {
      whereConditions.push("DATE(c.claim_register_date) <= ?");
      queryParams.push(dateTo);
    }

    // Price range filter
    if (minPrice) {
      whereConditions.push("w.purchase_price >= ?");
      queryParams.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      whereConditions.push("w.purchase_price <= ?");
      queryParams.push(parseFloat(maxPrice));
    }

    const whereClause = whereConditions.join(" AND ");

    // Validate sort column to prevent SQL injection
    const allowedSortColumns = [
      "claim_register_date",
      "claim_result_date",
      "customer_name",
      "purchase_price",
      "claim_external_id",
      "warranty_external_id",
      "customer_city",
    ];
    const validSortBy = allowedSortColumns.includes(sortBy)
      ? sortBy === "customer_name"
        ? "w.customer_name"
        : sortBy === "purchase_price"
        ? "w.purchase_price"
        : sortBy === "warranty_external_id"
        ? "w.external_id"
        : sortBy === "customer_city"
        ? "w.customer_city"
        : `c.${sortBy}`
      : "c.claim_register_date";
    const validSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM claims c
      JOIN warranties w ON c.warranty_id = w.id
      JOIN claim_statuses cs ON c.claim_status_id = cs.id
      WHERE ${whereClause}
    `;
    const countResult = await selectQuery<RowDataPacket>(countQuery, queryParams);
    const totalRecords = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch claims with pagination
    const claimsQuery = `
      SELECT 
        c.id,
        c.warranty_id,
        c.claim_external_id,
        c.defect_description,
        c.photo_url,
        c.video_url,
        c.admin_notes,
        c.claim_register_date,
        c.claim_result_date,
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
        w.purchase_from
      FROM claims c
      JOIN warranties w ON c.warranty_id = w.id
      JOIN claim_statuses cs ON c.claim_status_id = cs.id
      WHERE ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT ? OFFSET ?
    `;

    const claims = await selectQuery<ClaimRow>(claimsQuery, [
      ...queryParams,
      String(limit),
      String(offset),
    ]);

    // Calculate statistics
    const totalClaims = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM claims 
       WHERE is_deleted = 0`
    );

    const pendingClaims = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM claims c
       JOIN claim_statuses cs ON c.claim_status_id = cs.id
       WHERE c.is_deleted = 0 AND cs.name IN ('pending', 'under_review')`
    );

    const approvedClaims = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM claims c
       JOIN claim_statuses cs ON c.claim_status_id = cs.id
       WHERE c.is_deleted = 0 AND cs.name = 'approved'`
    );

    const rejectedClaims = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM claims c
       JOIN claim_statuses cs ON c.claim_status_id = cs.id
       WHERE c.is_deleted = 0 AND cs.name = 'rejected'`
    );

    const shippedClaims = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM claims c
       JOIN claim_statuses cs ON c.claim_status_id = cs.id
       WHERE c.is_deleted = 0 AND cs.name = 'shipped'`
    );

    const completedClaims = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM claims c
       JOIN claim_statuses cs ON c.claim_status_id = cs.id
       WHERE c.is_deleted = 0 AND cs.name = 'completed'`
    );

    const thisMonthClaims = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM claims 
       WHERE is_deleted = 0 
       AND YEAR(claim_register_date) = YEAR(CURRENT_DATE())
       AND MONTH(claim_register_date) = MONTH(CURRENT_DATE())`
    );

    // Get unique cities for filter
    const cities = await selectQuery<RowDataPacket>(
      `SELECT DISTINCT w.customer_city as city
       FROM claims c
       JOIN warranties w ON c.warranty_id = w.id
       WHERE c.is_deleted = 0 AND w.customer_city IS NOT NULL AND w.customer_city != ''
       ORDER BY w.customer_city ASC`
    );

    return NextResponse.json(
      {
        claims,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        stats: {
          total: totalClaims[0]?.count || 0,
          pending: pendingClaims[0]?.count || 0,
          approved: approvedClaims[0]?.count || 0,
          rejected: rejectedClaims[0]?.count || 0,
          shipped: shippedClaims[0]?.count || 0,
          completed: completedClaims[0]?.count || 0,
          thisMonth: thisMonthClaims[0]?.count || 0,
        },
        filters: {
          cities: cities.map((c) => c.city),
          statuses: [
            "pending",
            "under_review",
            "approved",
            "rejected",
            "shipped",
            "completed",
          ],
          purchaseFromOptions: [
            "official_store",
            "amazon",
            "flipkart",
            "retail_store",
            "other",
          ],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get claims error:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}
