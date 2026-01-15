import { NextRequest, NextResponse } from "next/server";
import { selectQuery } from "@/lib/db";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { generateOTP } from "@/lib/auth";
import { sendAdminLoginOTP } from "@/lib/email";
import crypto from "crypto";

// ✅ OTP Record interface for admin login
interface AdminOtpRecord extends RowDataPacket {
  id: string;
  email: string;
  encrypted_otp: string;
  iv: string;
  tag: string;
  expires_at: string;
  created_at: string;
}

interface AdminRow extends RowDataPacket {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
}

// Database connection config
const dbConfig = {
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  port: parseInt(process.env.DB_PORT || "3306"),
};

// Encryption configuration (same as warranty OTP)
const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = Buffer.from(
  process.env.OTP_ENCRYPTION_KEY! as string,
  "hex"
);

// ✅ Encryption functions (reuse from warranty OTP)
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

async function getDbConnection(): Promise<mysql.Connection> {
  return await mysql.createConnection(dbConfig);
}

// POST - Send Admin OTP
export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = (email as string).toLowerCase();
    connection = await getDbConnection();

    // ✅ Check if admin exists and is active
    const admins = await selectQuery<AdminRow>(
      "SELECT * FROM admins WHERE email = ? AND is_active = TRUE AND is_deleted = FALSE",
      [normalizedEmail]
    );

    if (admins.length === 0) {
      return NextResponse.json(
        { error: "Admin not found or inactive" },
        { status: 404 }
      );
    }

    // ✅ Generate and encrypt OTP
    const otp = generateOTP();
    const { encrypted, iv, tag } = encryptOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ Delete existing OTPs for this email
    await connection.execute<ResultSetHeader>(
      'DELETE FROM otp_verifications WHERE email = ?',
      [normalizedEmail]
    );

    // ✅ Store encrypted OTP (reuse same table as warranty)
    await connection.execute<ResultSetHeader>(
      `INSERT INTO otp_verifications (id, email, encrypted_otp, iv, tag, expires_at, created_at) 
       VALUES (UUID(), ?, ?, ?, ?, ?, NOW())`,
      [normalizedEmail, encrypted, iv, tag, expiresAt]
    );

    console.log(`[Admin OTP] Stored encrypted OTP for ${normalizedEmail} (expires: ${expiresAt.toISOString()})`);

    // Send OTP email
    await sendAdminLoginOTP(email as string, otp);

    return NextResponse.json(
      { message: "OTP sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Verify Admin OTP
export async function PUT(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = (email as string).toLowerCase();
    connection = await getDbConnection();

    // ✅ Verify admin exists
    const admins = await selectQuery<AdminRow>(
      "SELECT * FROM admins WHERE email = ? AND is_active = TRUE AND is_deleted = FALSE",
      [normalizedEmail]
    );

    if (admins.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const admin = admins[0];

    // ✅ Fetch latest encrypted OTP
    const [rows] = await connection!.execute<AdminOtpRecord[]>(
      `SELECT * FROM otp_verifications 
       WHERE email = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [normalizedEmail]
    );

    const otpRecord = rows[0] as AdminOtpRecord | undefined;

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP not found or expired" },
        { status: 400 }
      );
    }

    // ✅ Check expiry
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);
    
    if (now > expiresAt) {
      await connection!.execute<ResultSetHeader>(
        'DELETE FROM otp_verifications WHERE id = ?',
        [otpRecord.id]
      );
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // ✅ Decrypt and verify OTP
    const decryptedOtp = decryptOTP(
      otpRecord.encrypted_otp,
      otpRecord.iv,
      otpRecord.tag
    );

    if (decryptedOtp !== (otp as string).trim()) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // ✅ Delete used OTP
    await connection!.execute<ResultSetHeader>(
      'DELETE FROM otp_verifications WHERE id = ?',
      [otpRecord.id]
    );

    console.log(`[Admin OTP] Successfully verified for ${normalizedEmail}`);

    // ✅ Generate JWT token
    const { generateToken } = await import("@/lib/auth");
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });

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
    });

    return response;
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
