import { NextRequest, NextResponse } from "next/server";
import { sendOTPViaSMS } from "@/lib/twilio";

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json();

    if (!mobile) {
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 }
      );
    }

    // Validate mobile format (E.164)
    const cleanMobile = mobile.replace(/\s+/g, "");
    const mobileRegex = /^\+[1-9]\d{10,14}$/;
    
    if (!mobileRegex.test(cleanMobile)) {
      return NextResponse.json(
        { error: "Invalid mobile number. Use format: +919876543210" },
        { status: 400 }
      );
    }

    // Send OTP via Twilio Verify (no manual OTP needed)
    const sent = await sendOTPViaSMS(cleanMobile);

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please check Twilio Verify configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "OTP sent successfully to your mobile" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
