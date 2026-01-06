import { NextRequest, NextResponse } from "next/server";
import { sendWarrantyOTP } from "@/lib/email";
import { otpStore } from "@/lib/otp-store";

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST - Send or Verify OTP
export async function POST(request: NextRequest) {
  try {
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

    const normalizedEmail = email.toLowerCase();

    // Action: send (default action if not specified)
    if (!action || action === "send") {
      // Generate OTP
      const generatedOtp = generateOTP();

      // Store OTP with 10-minute expiry
      const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
      otpStore.set(normalizedEmail, { otp: generatedOtp, expires });

      console.log(`[OTP] Stored for ${normalizedEmail}: ${generatedOtp} (expires: ${new Date(expires).toISOString()})`);

      // Send OTP via email
      try {
        await sendWarrantyOTP(email, generatedOtp);
      } catch (emailError) {
        console.error("[OTP] Email send failed:", emailError);
        // Clean up stored OTP if email fails
        otpStore.delete(normalizedEmail);
        return NextResponse.json(
          { error: "Failed to send OTP email. Please try again." },
          { status: 500 }
        );
      }

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

      const data = otpStore.get(normalizedEmail);

      console.log(`[OTP] Verification attempt for ${normalizedEmail}:`, {
        provided: otp,
        stored: data?.otp,
        expires: data?.expires ? new Date(data.expires).toISOString() : 'N/A',
        isExpired: data ? Date.now() > data.expires : true
      });

      if (!data) {
        return NextResponse.json(
          { error: "OTP not found or expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Check expiry
      if (Date.now() > data.expires) {
        otpStore.delete(normalizedEmail);
        console.log(`[OTP] Expired for ${normalizedEmail}`);
        return NextResponse.json(
          { error: "OTP has expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Verify OTP (trim whitespace and compare as strings)
      if (data.otp.trim() === otp.trim()) {
        otpStore.delete(normalizedEmail); // Remove after successful verification
        console.log(`[OTP] Successfully verified for ${normalizedEmail}`);
        return NextResponse.json(
          { message: "Email verified successfully!" },
          { status: 200 }
        );
      }

      console.log(`[OTP] Invalid OTP for ${normalizedEmail}`);
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
