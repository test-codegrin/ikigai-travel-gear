import { NextRequest, NextResponse } from "next/server";
import { selectQuery, mutationQuery } from "@/lib/db";
import { generateOTP } from "@/lib/auth";
import { sendAdminLoginOTP } from "@/lib/email";
import { RowDataPacket } from "mysql2/promise";

interface AdminRow extends RowDataPacket {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
}

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if admin exists
    const admins = await selectQuery<AdminRow>(
      "SELECT * FROM admins WHERE email = ? AND is_active = TRUE AND is_deleted = FALSE",
      [email]
    );

    if (admins.length === 0) {
      return NextResponse.json(
        { error: "Admin not found or inactive" },
        { status: 404 }
      );
    }

    const admin = admins[0];

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email, { otp, expires });

    // Send OTP via email
    await sendAdminLoginOTP(email, otp);

    return NextResponse.json(
      { message: "OTP sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

// Verify OTP
export async function PUT(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const stored = otpStore.get(email);

    if (!stored) {
      return NextResponse.json(
        { error: "OTP not found or expired" },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(email);
      return NextResponse.json(
        { error: "OTP expired" },
        { status: 400 }
      );
    }

    if (stored.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // OTP valid, get admin details
    const admins = await selectQuery<AdminRow>(
      "SELECT * FROM admins WHERE email = ? AND is_active = TRUE AND is_deleted = FALSE",
      [email]
    );

    if (admins.length === 0) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    const admin = admins[0];

    // Clear OTP
    otpStore.delete(email);

    // Generate JWT token
    const { generateToken } = await import("@/lib/auth");
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });

    // Set cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      },
      { status: 200 }
    );

    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
