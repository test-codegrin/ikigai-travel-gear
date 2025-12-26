import { NextRequest, NextResponse } from "next/server";
import { sendWarrantyOTP } from "@/lib/email";

// In-memory OTP storage
const otpStore = new Map<string, { otp: string; expires: number }>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expires) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

// POST - Send or Verify OTP
export async function POST(request: NextRequest) {
  try {
    // Read the request body ONCE
    const body = await request.json();
    const { email, action, otp } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Action: send (default action if not specified)
    if (!action || action === "send") {
      // Generate OTP
      const generatedOtp = generateOTP();

      // Store OTP with 10-minute expiry
      const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
      otpStore.set(email.toLowerCase(), { otp: generatedOtp, expires });

      // Send OTP via email
      await sendWarrantyOTP(email, generatedOtp);

      return NextResponse.json(
        { message: "OTP sent successfully to your email" },
        { status: 200 }
      );
    }

    // Action: verify
    if (action === "verify") {
      if (!otp) {
        return NextResponse.json(
          { error: "OTP is required" },
          { status: 400 }
        );
      }

      const normalizedEmail = email.toLowerCase();
      const data = otpStore.get(normalizedEmail);

      if (!data) {
        return NextResponse.json(
          { error: "OTP not found or expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Check expiry
      if (Date.now() > data.expires) {
        otpStore.delete(normalizedEmail);
        return NextResponse.json(
          { error: "OTP has expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Verify OTP
      if (data.otp === otp) {
        otpStore.delete(normalizedEmail); // Remove after successful verification
        return NextResponse.json(
          { message: "Email verified successfully!" },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'send' or 'verify'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("OTP API error:", error);
    return NextResponse.json(
      { error: "Failed to process OTP request" },
      { status: 500 }
    );
  }
}
