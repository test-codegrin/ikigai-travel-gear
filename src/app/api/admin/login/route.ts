import { NextRequest, NextResponse } from "next/server";
import { selectQuery } from "@/lib/db";
import { generateOTP } from "@/lib/auth";
import { sendAdminLoginOTP } from "@/lib/email";
import crypto from "crypto";

const ENCRYPTION_KEY = Buffer.from(process.env.OTP_ENCRYPTION_KEY ?? "", "hex");
const ALGORITHM = "aes-256-gcm";

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

function toMySQLDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
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

    // ✅ FIXED: Raw query result + type assertion
    const admins = await selectQuery(
      "SELECT id, email, name FROM admins WHERE email = ? AND is_active = TRUE AND is_deleted = FALSE",
      [normalizedEmail]
    ) as { id: number; email: string; name: string }[];

    if (admins.length === 0) {
      return NextResponse.json({ error: "Admin not found or inactive" }, { status: 404 });
    }

    const otp = generateOTP();
    const { encrypted, iv, tag } = encryptOTP(otp);
    const expiresAt = toMySQLDateTime(new Date(Date.now() + 10 * 60 * 1000));

    await selectQuery('DELETE FROM otp_verifications WHERE email = ?', [normalizedEmail]);
    
    await selectQuery(
      `INSERT INTO otp_verifications (id, email, encrypted_otp, iv, tag, expires_at, created_at) 
       VALUES (UUID(), ?, ?, ?, ?, ?, NOW())`,
      [normalizedEmail, encrypted, iv, tag, expiresAt]
    );

    console.log(`[Admin OTP] Stored for ${normalizedEmail}, expires: ${expiresAt}`);
    
    sendAdminLoginOTP(email, otp).catch(err => {
      console.error("[Admin OTP] Email failed:", err);
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error: Error | unknown) {
    console.error("[Admin Login POST]", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

// ✅ PUT - Verify Admin OTP (NO TOKEN EXPIRY)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email;
    const otp = body?.otp;

    if (!email || !otp || typeof email !== "string" || typeof otp !== "string") {
      return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ✅ FIXED: Raw query result + type assertion
    const admins = await selectQuery(
      "SELECT id, email, name FROM admins WHERE email = ? AND is_active = TRUE AND is_deleted = FALSE",
      [normalizedEmail]
    ) as { id: number; email: string; name: string }[];

    if (admins.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const admin = admins[0];

    // ✅ FIXED: Raw query result + type assertion
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

    // ✅ UTC expiry check
    const now = toMySQLDateTime(new Date());
    const expiresAt = toMySQLDateTime(new Date(otpRecord.expires_at));
    
    if (new Date(now) > new Date(expiresAt)) {
      await selectQuery('DELETE FROM otp_verifications WHERE id = ?', [otpRecord.id]);
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // ✅ Decrypt & verify
    const decryptedOtp = decryptOTP(otpRecord.encrypted_otp, otpRecord.iv, otpRecord.tag);
    
    console.log(`[Admin OTP] Verify: input=${otp.trim()}, decrypted=${decryptedOtp}`);

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

    // ✅ NO maxAge = Permanent cookie (until logout/browser delete)
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
      // ✅ REMOVED: maxAge - token never expires automatically
    });

    return response;
  } catch (error: Error | unknown) {
    console.error("[Admin Login PUT]", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
