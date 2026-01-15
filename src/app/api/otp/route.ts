import { NextRequest, NextResponse } from "next/server";
import { sendWarrantyOTP } from "@/lib/email";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import crypto from "crypto";

// ✅ OTP Record interface matching MySQL schema
interface OtpRecord extends RowDataPacket {
  id: string;
  email: string;
  encrypted_otp: string;
  iv: string;
  tag: string;
  expires_at: string;
  created_at: string;
}

// Database connection config
const dbConfig = {
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  port: parseInt(process.env.DB_PORT || "3306"),
};

// Encryption configuration
const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = Buffer.from(
  process.env.OTP_ENCRYPTION_KEY! as string,
  "hex"
);

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

// ✅ FIXED: Always store UTC in DB
function toMySQLDateTimeUTC(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' '); // Always UTC
}

// ✅ FIXED: Calculate expiration with server timezone offset
function calculateExpiryTime(): Date {
  const offsetHours = getServerOffsetHours();
  const nowServerTime = new Date(); // Server's local time
  const nowUTC = new Date(nowServerTime.getTime() - (offsetHours * 60 * 60 * 1000)); // Convert to UTC
  
  // Add 10 minutes to server time (UTC normalized)
  return new Date(nowUTC.getTime() + 10 * 60 * 1000);
}

// ✅ NEW: Check expiry considering server timezone
function isOTPExpired(serverExpiresAt: string): boolean {
  const offsetHours = getServerOffsetHours();
  const nowServerTime = new Date();
  const nowUTC = new Date(nowServerTime.getTime() - (offsetHours * 60 * 60 * 1000));
  const expiresUTC = new Date(serverExpiresAt + 'Z'); // Assume DB stores UTC
  
  return nowUTC > expiresUTC;
}

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Encrypt OTP
function encryptOTP(otp: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(otp, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

// Decrypt OTP
function decryptOTP(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(tag, "hex"));
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Helper function to get DB connection
async function getDbConnection(): Promise<mysql.Connection> {
  return await mysql.createConnection(dbConfig);
}

// POST - Send or Verify OTP
export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const body = await request.json();
    const { email, action, otp } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email as string)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    const normalizedEmail = (email as string).toLowerCase();
    connection = await getDbConnection();

    // Action: send OTP
    if (!action || action === "send") {
      const generatedOtp = generateOTP();
      const { encrypted, iv, tag } = encryptOTP(generatedOtp);
      const expiresAtUTC = calculateExpiryTime(); // ✅ Server timezone aware

      // Delete existing OTPs
      await connection.execute<ResultSetHeader>(
        'DELETE FROM otp_verifications WHERE email = ?',
        [normalizedEmail]
      );

      // Insert new encrypted OTP (UTC)
      await connection.execute<ResultSetHeader>(
        `INSERT INTO otp_verifications (id, email, encrypted_otp, iv, tag, expires_at, created_at) 
         VALUES (UUID(), ?, ?, ?, ?, ?, NOW())`,
        [normalizedEmail, encrypted, iv, tag, toMySQLDateTimeUTC(expiresAtUTC)]
      );

      console.log(`[Warranty OTP] Stored for ${normalizedEmail}, expires: ${toMySQLDateTimeUTC(expiresAtUTC)}, server_tz: ${process.env.SERVER_TIMEZONE}`);
      
      await sendWarrantyOTP(email as string, generatedOtp);

      return NextResponse.json(
        { message: "OTP sent successfully to your email" },
        { status: 200 }
      );
    }

    // Action: verify OTP
    if (action === "verify") {
      if (!otp) {
        return NextResponse.json({ error: "OTP is required" }, { status: 400 });
      }

      // ✅ FIXED: Proper SELECT query typing
      const [rows] = await connection!.execute<OtpRecord[]>(
        `SELECT * FROM otp_verifications 
         WHERE email = ? 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [normalizedEmail]
      );

      const otpRecord = rows[0] as OtpRecord | undefined;

      console.log(`[Warranty OTP] Verification attempt for ${normalizedEmail}, server_tz: ${process.env.SERVER_TIMEZONE}`);

      if (!otpRecord) {
        return NextResponse.json(
          { error: "OTP not found or expired. Please request a new one." },
          { status: 400 }
        );
      }

      // ✅ FIXED: Proper timezone-aware expiry check
      if (isOTPExpired(otpRecord.expires_at)) {
        await connection!.execute<ResultSetHeader>(
          'DELETE FROM otp_verifications WHERE id = ?',
          [otpRecord.id]
        );
        console.log(`[Warranty OTP] Expired for ${normalizedEmail}`);
        return NextResponse.json(
          { error: "OTP has expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Decrypt and verify OTP
      const decryptedOtp = decryptOTP(
        otpRecord.encrypted_otp,
        otpRecord.iv,
        otpRecord.tag
      );

      if (decryptedOtp === (otp as string).trim()) {
        // Delete successful OTP
        await connection!.execute<ResultSetHeader>(
          'DELETE FROM otp_verifications WHERE id = ?',
          [otpRecord.id]
        );
        console.log(`[Warranty OTP] Successfully verified for ${normalizedEmail}`);
        return NextResponse.json(
          { message: "Email verified successfully!" },
          { status: 200 }
        );
      }

      console.log(`[Warranty OTP] Invalid OTP for ${normalizedEmail}`);
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
    console.error("Warranty OTP API error:", error);
    return NextResponse.json(
      { error: "Failed to process OTP request" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
