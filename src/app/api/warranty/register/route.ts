import { NextRequest, NextResponse } from "next/server";
import { mutationQuery, selectQuery } from "@/lib/db";
import { saveFile } from "@/lib/file-upload";
import { sendWarrantyConfirmation } from "@/lib/email";
import { RowDataPacket } from "mysql2/promise";
import { randomBytes } from "crypto";

interface StatusRow extends RowDataPacket {
  id: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const mobile = formData.get("mobile") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const pincode = formData.get("pincode") as string;
    const purchase_date = formData.get("purchase_date") as string;
    const purchase_from = formData.get("purchase_from") as string;
    const purchase_price = formData.get("purchase_price") as string;
    const invoice_file = formData.get("invoice_file") as File;
    const warranty_card_file = formData.get("warranty_card_file") as File;

    // Validation
    if (!name || !email || !mobile || !purchase_date || !purchase_from) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!invoice_file || !warranty_card_file) {
      return NextResponse.json(
        { error: "Invoice and warranty card files are required" },
        { status: 400 }
      );
    }

    // Upload files to ImageKit (organized in folders)
    const invoiceUpload = await saveFile(invoice_file, "invoice");
    const warrantyCardUpload = await saveFile(warranty_card_file, "warranty-card");

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

    // Insert warranty with all customer data and ImageKit file IDs
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
        invoiceUpload.url,
        invoiceUpload.fileId,
        warrantyCardUpload.url,
        warrantyCardUpload.fileId,
        statusId,
      ]
    );

    // Send confirmation email
    try {
      await sendWarrantyConfirmation(email, name, external_id);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        message: "Warranty registered successfully",
        warranty_id: external_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Warranty registration error:", error);
    return NextResponse.json(
      { error: "Failed to register warranty" },
      { status: 500 }
    );
  }
}
