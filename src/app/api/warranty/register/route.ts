import { NextRequest, NextResponse } from "next/server";
import { mutationQuery, selectQuery } from "@/lib/db";
import { saveFile } from "@/lib/file-upload";
import { sendWarrantyConfirmation } from "@/lib/email";
import { sendWarrantyConfirmationSMS } from "@/lib/twilio";
import { RowDataPacket } from "mysql2/promise";
import { randomBytes } from "crypto";

interface CustomerRow extends RowDataPacket {
  id: number;
  email: string;
}

interface StatusRow extends RowDataPacket {
  id: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const mobile = formData.get("mobile") as string;
    const purchase_date = formData.get("purchase_date") as string;
    const product_description = formData.get("product_description") as string;
    const warranty_card_number = formData.get("warranty_card_number") as string | null;
    const invoice_file = formData.get("invoice_file") as File;
    const warranty_card_file = formData.get("warranty_card_file") as File;

    // Validation
    if (!name || !email || !mobile || !purchase_date || !product_description) {
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

    // Upload files
    const invoice_file_url = await saveFile(invoice_file, "invoice");
    const warranty_card_file_url = await saveFile(warranty_card_file, "warranty-card");

    // Check if customer exists
    const existingCustomer = await selectQuery<CustomerRow>(
      "SELECT id FROM customers WHERE email = ? AND is_deleted = FALSE",
      [email]
    );

    let customerId: number;

    if (existingCustomer.length > 0) {
      customerId = existingCustomer[0].id;
    } else {
      // Create new customer
      const result = await mutationQuery(
        "INSERT INTO customers (name, email, mobile) VALUES (?, ?, ?)",
        [name, email, mobile]
      );
      customerId = result.insertId;
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

    // Generate external_id
    const external_id = `IKG-${randomBytes(6).toString("hex").toUpperCase()}`;

    // Insert warranty
    await mutationQuery(
      `INSERT INTO warranties (
        external_id, customer_id, purchase_date, invoice_file_url,
        warranty_card_number, warranty_card_file_url, product_description,
        warranty_status_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        external_id,
        customerId,
        purchase_date,
        invoice_file_url,
        warranty_card_number,
        warranty_card_file_url,
        product_description,
        statusId,
      ]
    );

    // Send confirmation email
    try {
      await sendWarrantyConfirmation(email, name, external_id);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    // Send confirmation SMS
    try {
      await sendWarrantyConfirmationSMS(mobile, name, external_id);
    } catch (smsError) {
      console.error("Failed to send confirmation SMS:", smsError);
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
