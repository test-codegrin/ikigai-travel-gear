import { NextRequest, NextResponse } from "next/server";
import { selectQuery, mutationQuery } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { sendClaimStatusUpdate } from "@/lib/email";
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
}

// Status messages for different claim states
const STATUS_MESSAGES: Record<string, string> = {
  pending:
    "Your warranty claim has been received and is pending review. Our team will assess your claim shortly.",
  under_review:
    "Your warranty claim is currently under review by our team. We are carefully examining the details and will update you soon.",
  approved:
    "Great news! Your warranty claim has been approved. Our team will contact you shortly with the next steps for repair or replacement.",
  rejected:
    "We regret to inform you that your warranty claim could not be approved. This may be due to the nature of the defect or warranty terms. Please contact our support team for more information.",
  shipped:
    "Your replacement product has been shipped. You will receive tracking details via email shortly. Thank you for your patience.",
  completed:
    "Your warranty claim has been completed successfully. Thank you for your patience throughout this process. If you have any questions, please don't hesitate to contact us.",
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
    const claimId = id;

    const body = await request.json();
    const { status_id, admin_notes } = body;

    if (!status_id) {
      return NextResponse.json(
        { error: "Status ID is required" },
        { status: 400 }
      );
    }

    // Get current claim details before update
    const currentClaim = await selectQuery<ClaimDetail>(
      `SELECT c.*, w.external_id as warranty_external_id,
        w.customer_name, w.customer_email, w.customer_mobile
       FROM claims c
       JOIN warranties w ON c.warranty_id = w.id
       WHERE c.claim_external_id = ? AND c.is_deleted = 0`,
      [claimId]
    );

    if (currentClaim.length === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const claim = currentClaim[0];

    // Prepare update query based on whether admin_notes is provided
    let updateQuery = "";
    let updateParams: (number|string)[] = [];

    if (admin_notes !== undefined && admin_notes !== null) {
      updateQuery = `UPDATE claims 
       SET claim_status_id = ?, admin_notes = ?, claim_result_date = CURRENT_TIMESTAMP
       WHERE claim_external_id = ? AND is_deleted = 0`;
      updateParams = [status_id, admin_notes, claimId];
    } else {
      updateQuery = `UPDATE claims 
       SET claim_status_id = ?, claim_result_date = CURRENT_TIMESTAMP
       WHERE claim_external_id = ? AND is_deleted = 0`;
      updateParams = [status_id, claimId];
    }

    // Update claim status
    const result = await mutationQuery(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Insert status history record
    await mutationQuery(
      `INSERT INTO claim_status_history 
       (claim_id, claim_status_id, changed_by, admin_notes) 
       VALUES (?, ?, ?, ?)`,
      [claim.id, status_id, admin.email, admin_notes || null]
    );

    // Fetch updated claim with customer details
    const updatedClaim = await selectQuery<ClaimDetail>(
      `SELECT 
        c.*,
        cs.name as claim_status_name,
        w.external_id as warranty_external_id,
        w.customer_name,
        w.customer_email,
        w.customer_mobile
      FROM claims c
      LEFT JOIN claim_statuses cs ON c.claim_status_id = cs.id
      LEFT JOIN warranties w ON c.warranty_id = w.id
      WHERE c.claim_external_id = ? AND c.is_deleted = 0`,
      [claimId]
    );

    if (updatedClaim.length === 0) {
      return NextResponse.json(
        { error: "Claim not found after update" },
        { status: 404 }
      );
    }

    const finalClaim = updatedClaim[0];

    // Update warranty status to "claimed" if claim is approved or in progress
    if (
      finalClaim.claim_status_name === "approved" ||
      finalClaim.claim_status_name === "shipped"
    ) {
      await mutationQuery(
        `UPDATE warranties 
         SET warranty_status_id = (SELECT id FROM warranty_statuses WHERE name = 'claimed' LIMIT 1)
         WHERE id = ?`,
        [finalClaim.warranty_id]
      );
    }

    // Send status update email to customer
    try {
      const statusName = finalClaim.claim_status_name || "Updated";
      const statusMessage =
        STATUS_MESSAGES[statusName.toLowerCase()] ||
        "Your claim status has been updated. Please check your claim details for more information.";

      await sendClaimStatusUpdate(
        finalClaim.customer_email,
        finalClaim.customer_name,
        finalClaim.claim_external_id,
        finalClaim.warranty_external_id,
        statusName,
        statusMessage
      );
    } catch (emailError) {
      console.error("Failed to send claim status update email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        message: "Claim status updated successfully",
        claim: finalClaim,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update claim status error:", error);
    return NextResponse.json(
      { error: "Failed to update claim status" },
      { status: 500 }
    );
  }
}
