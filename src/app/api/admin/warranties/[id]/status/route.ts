import { NextRequest, NextResponse } from "next/server";
import { selectQuery, mutationQuery } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { sendWarrantyStatusUpdate } from "@/lib/email";
import { RowDataPacket } from "mysql2/promise";

interface WarrantyDetail extends RowDataPacket {
  id: number;
  external_id: string;
  customer_name: string;
  customer_email: string;
  warranty_status_id: number;
  status_name: string;
  customer_mobile: string;
  customer_address: string;
  customer_city: string;
  customer_pincode: number;
  purchase_date: string;
  purchase_price: number;
  purchase_from: string;
  invoice_file_url: string;
  warranty_card_file_url: string;
  registration_date: string;
  created_at: string;
}

// Status messages for different warranty states
const STATUS_MESSAGES: Record<string, string> = {
  registered: "Your warranty has been successfully registered and is now active. Our team will review your submission shortly.",
  approved: "Great news! Your warranty has been approved. You're now covered under our warranty program.",
  rejected: "We regret to inform you that your warranty registration could not be approved. Please contact our support team for more information.",
  "under review": "Your warranty is currently under review by our team. We'll notify you once the review is complete.",
  expired: "Your warranty period has ended. Thank you for choosing Ikigai Travel Gear. Please contact us if you'd like to explore extended coverage options.",
  claimed: "Your warranty claim has been received and is being processed. Our team will contact you with next steps.",
  completed: "Your warranty claim has been completed successfully. Thank you for your patience throughout this process.",
};

export async function PUT(
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

    const body = await request.json();
    const { status_id } = body;

    if (!status_id) {
      return NextResponse.json(
        { error: "Status ID is required" },
        { status: 400 }
      );
    }

    // Update warranty status
    const result = await mutationQuery(
      `UPDATE warranties 
       SET warranty_status_id = ?
       WHERE external_id = ? AND is_deleted = FALSE`,
      [status_id, warrantyId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Warranty not found" },
        { status: 404 }
      );
    }

    // Fetch updated warranty with customer details
    const warranty = await selectQuery<WarrantyDetail>(
      `SELECT 
        w.*,
        ws.name as status_name
      FROM warranties w
      LEFT JOIN warranty_statuses ws ON w.warranty_status_id = ws.id
      WHERE w.external_id = ? AND w.is_deleted = FALSE`,
      [warrantyId]
    );

    if (warranty.length === 0) {
      return NextResponse.json(
        { error: "Warranty not found after update" },
        { status: 404 }
      );
    }

    const updatedWarranty = warranty[0];

    // Send status update email to customer
    try {
      const statusName = updatedWarranty.status_name || "Updated";
      const statusMessage =
        STATUS_MESSAGES[statusName.toLowerCase()] ||
        "Your warranty status has been updated. Please check your warranty details for more information.";

      await sendWarrantyStatusUpdate(
        updatedWarranty.customer_email,
        updatedWarranty.customer_name,
        updatedWarranty.external_id,
        statusName,
        statusMessage
      );
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        message: "Status updated successfully",
        warranty: updatedWarranty,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update warranty status error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
