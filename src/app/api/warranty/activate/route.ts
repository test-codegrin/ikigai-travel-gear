import { NextRequest, NextResponse } from "next/server";
import { mutationQuery, selectQuery } from "@/lib/db";
import { sendWarrantyConfirmation } from "@/lib/email";
import { RowDataPacket } from "mysql2/promise";
import { randomBytes } from "crypto";

interface StatusRow extends RowDataPacket {
  id: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body (files are already uploaded)
    const body = await request.json();

    const {
      name,
      email,
      mobile,
      address,
      city,
      pincode,
      purchase_date,
      purchase_from,
      purchase_price,
      invoice_file_url,
      invoice_file_id,
      warranty_card_file_url,
      warranty_card_file_id,
    } = body;

    // Validation
    if (!name || !email || !mobile || !purchase_date || !purchase_from) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!invoice_file_url || !warranty_card_file_url || !invoice_file_id || !warranty_card_file_id) {
      return NextResponse.json(
        { error: "Invoice and warranty card files are required" },
        { status: 400 }
      );
    }

    // Get 'registered' status ID
    const statusResult = await selectQuery<StatusRow>(
      "SELECT id FROM warranty_statuses WHERE name = 'registered' AND is_deleted = FALSE LIMIT 1"
    );

    if (statusResult.length === 0) {
      return NextResponse.json(
        { error: "Warranty status not found" },
        { status: 500 }
      );
    }

    const statusId = statusResult[0].id;

    // Generate external_id (Warranty ID)
    const external_id = `IKG-${randomBytes(6).toString("hex").toUpperCase()}`;

    // Insert warranty (files already uploaded to ImageKit)
    await mutationQuery(
      `INSERT INTO warranties (
        external_id,
        customer_name,
        customer_mobile,
        customer_email,
        customer_address,
        customer_city,
        customer_pincode,
        purchase_date,
        purchase_from,
        purchase_price,
        invoice_file_url,
        invoice_file_id,
        warranty_card_file_url,
        warranty_card_file_id,
        warranty_status_id,
        registration_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        external_id,
        name,
        mobile,
        email,
        address,
        city,
        pincode,
        purchase_date,
        purchase_from,
        purchase_price,
        invoice_file_url,
        invoice_file_id,
        warranty_card_file_url,
        warranty_card_file_id,
        statusId,
      ]
    );

    // Send confirmation email
    try {
      await sendWarrantyConfirmation(email, name, external_id);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return NextResponse.json(
      {
        message: "Warranty activated successfully",
        warranty_id: external_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Warranty registration error:", error);
    return NextResponse.json(
      { error: "Failed to activate warranty" },
      { status: 500 }
    );
  }
}
