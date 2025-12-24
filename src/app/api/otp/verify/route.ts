import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/twilio";

export async function POST(request: NextRequest) {
  try {
    const { mobile, otp } = await request.json();

    if (!mobile || !otp) {
      return NextResponse.json(
        { error: "Mobile number and OTP are required" },
        { status: 400 }
      );
    }

    const cleanMobile = mobile.replace(/\s+/g, "");

    // Verify OTP using Twilio Verify
    const isValid = await verifyOTP(cleanMobile, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Mobile number verified successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
