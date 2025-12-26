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
  purchase_from: string;
  invoice_file_url: string;
  warranty_card_file_url: string;
  status_name: string;
  registration_date: string;
}

// Type for SQL query parameters
type QueryParam = string | number | boolean | null;

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const city = searchParams.get("city") || "";
    const purchaseFrom = searchParams.get("purchase_from") || "";
    const sortBy = searchParams.get("sort_by") || "registration_date";
    const sortOrder = searchParams.get("sort_order") || "DESC";
    const dateFrom = searchParams.get("date_from") || "";
    const dateTo = searchParams.get("date_to") || "";
    const minPrice = searchParams.get("min_price") || "";
    const maxPrice = searchParams.get("max_price") || "";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build WHERE clause with filters
    const whereConditions = ["w.is_deleted = FALSE"];
    const queryParams: QueryParam[] = [];

    // Search filter (external_id, customer_name, customer_email, customer_mobile)
    if (search) {
      whereConditions.push(
        "(w.external_id LIKE ? OR w.customer_name LIKE ? OR w.customer_email LIKE ? OR w.customer_mobile LIKE ?)"
      );
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Status filter
    if (status && status.trim()) {
      whereConditions.push("ws.name = ?");
      queryParams.push(status);
    }

    // City filter
    if (city && city.trim()) {
      whereConditions.push("w.customer_city LIKE ?");
      queryParams.push(`%${city}%`);
    }

    // Purchase from filter
    if (purchaseFrom && purchaseFrom.trim()) {
      whereConditions.push("w.purchase_from = ?");
      queryParams.push(purchaseFrom);
    }

    // Date range filter
    if (dateFrom) {
      whereConditions.push("DATE(w.registration_date) >= ?");
      queryParams.push(dateFrom);
    }
    if (dateTo) {
      whereConditions.push("DATE(w.registration_date) <= ?");
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
      "registration_date",
      "purchase_date",
      "customer_name",
      "customer_city",
      "purchase_price",
      "external_id"
    ];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "registration_date";
    const validSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM warranties w
      JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
      WHERE ${whereClause}
    `;
    const countResult = await selectQuery<RowDataPacket>(countQuery, queryParams);
    const totalRecords = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch warranties with pagination
    // IMPORTANT: LIMIT and OFFSET must be strings for mysql2 .execute()
    const warrantiesQuery = `
      SELECT 
        w.*,
        ws.name as status_name
      FROM warranties w
      JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
      WHERE ${whereClause}
      ORDER BY w.${validSortBy} ${validSortOrder}
      LIMIT ? OFFSET ?
    `;
    
    const warranties = await selectQuery<WarrantyRow>(
      warrantiesQuery,
      [...queryParams, String(limit), String(offset)]
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

    const claimedWarranties = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM warranties w
       JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
       WHERE w.is_deleted = FALSE AND ws.name = 'claimed'`
    );

    const thisMonthWarranties = await selectQuery<RowDataPacket>(
      `SELECT COUNT(*) as count 
       FROM warranties 
       WHERE is_deleted = FALSE 
       AND YEAR(registration_date) = YEAR(CURRENT_DATE())
       AND MONTH(registration_date) = MONTH(CURRENT_DATE())`
    );

    // Get unique cities for filter options
    const cities = await selectQuery<RowDataPacket>(
      `SELECT DISTINCT customer_city as city 
       FROM warranties 
       WHERE is_deleted = FALSE 
       ORDER BY customer_city`
    );

    return NextResponse.json(
      {
        warranties,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        stats: {
          total: totalWarranties[0]?.count || 0,
          active: activeWarranties[0]?.count || 0,
          claimed: claimedWarranties[0]?.count || 0,
          thisMonth: thisMonthWarranties[0]?.count || 0
        },
        filters: {
          cities: cities.map(c => c.city),
          statuses: ["registered", "claimed", "approved", "rejected", "repaired", "replaced", "closed"],
          purchaseFromOptions: ["official_website", "amazon", "flipkart", "retail_store", "other"]
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get warranties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch warranties" },
      { status: 500 }
    );
  }
}
