import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken) {
  console.warn("⚠️ Twilio credentials not configured");
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Send OTP using Twilio Verify (works globally, no country restrictions)
export async function sendOTPViaSMS(mobile: string): Promise<boolean> {
  if (!client || !verifyServiceSid) {
    console.error("❌ Twilio Verify not configured");
    console.log("📱 [DEV MODE] OTP would be sent to:", mobile);
    return false;
  }

  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: mobile,
        channel: "sms",
      });

    console.log(`✅ OTP sent via Twilio Verify to ${mobile}`);
    console.log(`📊 Status: ${verification.status}`);
    return verification.status === "pending";
  } catch (error) {
    console.error("❌ Twilio Verify send error:", error);
    return false;
  }
}

// Verify OTP using Twilio Verify
export async function verifyOTP(mobile: string, otp: string): Promise<boolean> {
  if (!client || !verifyServiceSid) {
    console.error("❌ Twilio Verify not configured");
    return false;
  }

  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: mobile,
        code: otp,
      });

    console.log(`✅ OTP verification for ${mobile}: ${verificationCheck.status}`);
    return verificationCheck.status === "approved";
  } catch (error) {
    console.error("❌ Twilio Verify check error:", error);
    return false;
  }
}

// Send warranty confirmation SMS (optional - email only for now)
export async function sendWarrantyConfirmationSMS(
  mobile: string,
  name: string,
  warrantyId: string
): Promise<boolean> {
  console.log(`📧 Warranty confirmation for ${name} - ID: ${warrantyId}`);
  // Skip SMS confirmation, use email instead
  return true;
}
