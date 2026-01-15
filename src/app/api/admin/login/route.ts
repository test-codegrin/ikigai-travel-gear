import { NextRequest, NextResponse } from "next/server";
import { selectQuery } from "@/lib/db";
import { generateOTP } from "@/lib/auth";
import { sendAdminLoginOTP } from "@/lib/email";
import crypto from "crypto";

const ENCRYPTION_KEY = Buffer.from(process.env.OTP_ENCRYPTION_KEY ?? "", "hex");
const ALGORITHM = "aes-256-gcm";

// ✅ NEW: Timezone offset calculator (hours from UTC)
function getServerOffsetHours(): number {
  const serverTimezone = process.env.SERVER_TIMEZONE?.toUpperCase();
  
  const timezoneOffsets: Record<string, number> = {
    'IST': 5.5,    // UTC+5:30
    'MST': -7,     // UTC-7 (Mountain Standard Time)
    'MDT': -6,     // UTC-6 (Mountain Daylight Time)
    'PST': -8,     // UTC-8
    'PDT': -7,     // UTC-7
    'EST': -5,     // UTC-5
    'EDT': -4,     // UTC-4
    'UTC': 0,
    'GMT': 0
  };

  return timezoneOffsets[serverTimezone ?? 'UTC'] ?? 0;
}

function encryptOTP(otp: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(otp, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  
  return { encrypted, iv: iv.toString("hex"), tag: tag.toString("hex") };
}

function decryptOTP(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(tag, "hex"));
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// ✅ FIXED: Always store UTC in DB, convert client time to UTC
function toMySQLDateTimeUTC(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' '); // Always UTC
}

// ✅ FIXED: Calculate expiration with server timezone offset
function calculateExpiryTime(): Date {
  const offsetHours = getServerOffsetHours();
  const nowServerTime = new Date(); // Server's local time
  const nowUTC = new Date(nowServerTime.getTime() + (offsetHours * 60 * 60 * 1000));
  
  // Add 10 minutes to server time (UTC normalized)
  return new Date(nowUTC.getTime() + 10 * 60 * 1000);
}

// ✅ NEW: Check expiry considering server timezone
function isOTPExpired(serverExpiresAt: string): boolean {
  const offsetHours = getServerOffsetHours();
  const nowServerTime = new Date();
  const nowUTC = new Date(nowServerTime.getTime() + (offsetHours * 60 * 60 * 1000));
  const expiresUTC = new Date(serverExpiresAt + 'Z'); // Assume DB stores UTC
  
  return nowUTC > expiresUTC;
}

// ✅ POST - Send Admin OTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const admins = await selectQuery(
      "SELECT id, email, name FROM admins WHERE email = ? AND is_active = TRUE AND is_deleted = FALSE",
      [normalizedEmail]
    ) as { id: number; email: string; name: string }[];

    if (admins.length === 0) {
      return NextResponse.json({ error: "Admin not found or inactive" }, { status: 404 });
    }

    const otp = generateOTP();
    const { encrypted, iv, tag } = encryptOTP(otp);
    const expiresAtUTC = calculateExpiryTime(); // ✅ Server timezone aware

    await selectQuery('DELETE FROM otp_verifications WHERE email = ?', [normalizedEmail]);
    
    await selectQuery(
      `INSERT INTO otp_verifications (id, email, encrypted_otp, iv, tag, expires_at, created_at) 
       VALUES (UUID(), ?, ?, ?, ?, ?, NOW())`,
      [normalizedEmail, encrypted, iv, tag, toMySQLDateTimeUTC(expiresAtUTC)]
    );

    console.log(`[Admin OTP] Stored for ${normalizedEmail}, expires: ${toMySQLDateTimeUTC(expiresAtUTC)}, server_tz: ${process.env.SERVER_TIMEZONE}`);
    
    sendAdminLoginOTP(email, otp).catch(err => {
      console.error("[Admin OTP] Email failed:", err);
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error: Error | unknown) {
    console.error("[Admin Login POST]", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

// ✅ PUT - Verify Admin OTP
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email;
    const otp = body?.otp;

    if (!email || !otp || typeof email !== "string" || typeof otp !== "string") {
      return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const admins = await selectQuery(
      "SELECT id, email, name FROM admins WHERE email = ? AND is_active = TRUE AND is_deleted = FALSE",
      [normalizedEmail]
    ) as { id: number; email: string; name: string }[];

    if (admins.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const admin = admins[0];

    const otpRecords = await selectQuery(
      `SELECT * FROM otp_verifications 
       WHERE email = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [normalizedEmail]
    ) as { id: string; encrypted_otp: string; iv: string; tag: string; expires_at: string }[];

    const otpRecord = otpRecords[0];
    if (!otpRecord) {
      return NextResponse.json({ error: "No OTP found" }, { status: 400 });
    }

    // ✅ FIXED: Proper timezone-aware expiry check
    if (isOTPExpired(otpRecord.expires_at)) {
      await selectQuery('DELETE FROM otp_verifications WHERE id = ?', [otpRecord.id]);
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // ✅ Decrypt & verify
    const decryptedOtp = decryptOTP(otpRecord.encrypted_otp, otpRecord.iv, otpRecord.tag);
    
    console.log(`[Admin OTP] Verify: input=${otp.trim()}, decrypted=${decryptedOtp}, server_tz: ${process.env.SERVER_TIMEZONE}`);

    if (decryptedOtp !== otp.trim()) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // ✅ Delete used OTP
    await selectQuery('DELETE FROM otp_verifications WHERE id = ?', [otpRecord.id]);

    // ✅ Generate JWT (NO EXPIRY)
    const { generateToken } = await import("@/lib/auth");
    const token = generateToken({ 
      id: admin.id, 
      email: admin.email, 
      name: admin.name 
    });

    const response = NextResponse.json({
      message: "Login successful",
      admin: { id: admin.id, email: admin.email, name: admin.name }
    });

    // ✅ NO maxAge = Permanent cookie
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    return response;
  } catch (error: Error | unknown) {
    console.error("[Admin Login PUT]", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
