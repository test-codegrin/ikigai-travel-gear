import { NextRequest, NextResponse } from "next/server";
import { sendWarrantyOTP } from "@/lib/email";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import crypto from "crypto";

interface OtpRecord extends RowDataPacket {
  id: string;
  email: string;
  encrypted_otp: string;
  iv: string;
  tag: string;
  created_at: string;
}

const dbConfig = {
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  port: parseInt(process.env.DB_PORT || "3306"),
};

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = Buffer.from(process.env.OTP_ENCRYPTION_KEY! as string, "hex");

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

async function getDbConnection(): Promise<mysql.Connection> {
  return await mysql.createConnection(dbConfig);
}

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const body = await request.json();
    const { email, action, otp } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalizedEmail = (email as string).toLowerCase();
    connection = await getDbConnection();

    // Send OTP
    if (!action || action === "send") {
      const generatedOtp = generateOTP();
      const { encrypted, iv, tag } = encryptOTP(generatedOtp);

      await connection.execute<ResultSetHeader>('DELETE FROM otp_verifications WHERE email = ?', [normalizedEmail]);
      await connection.execute<ResultSetHeader>(
        `INSERT INTO otp_verifications (id, email, encrypted_otp, iv, tag, created_at) 
         VALUES (UUID(), ?, ?, ?, ?, NOW())`,
        [normalizedEmail, encrypted, iv, tag]
      );

      console.log(`[Warranty OTP] Stored for ${normalizedEmail}`);
      await sendWarrantyOTP(email as string, generatedOtp);

      return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
    }

    // Verify OTP (NO EXPIRY)
    if (action === "verify") {
      if (!otp) {
        return NextResponse.json({ error: "OTP required" }, { status: 400 });
      }

      const [rows] = await connection!.execute<OtpRecord[]>(
        `SELECT id, encrypted_otp, iv, tag FROM otp_verifications 
         WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
        [normalizedEmail]
      );

      const otpRecord = rows[0] as OtpRecord | undefined;
      if (!otpRecord) {
        return NextResponse.json({ error: "No OTP found" }, { status: 400 });
      }

      const decryptedOtp = decryptOTP(otpRecord.encrypted_otp, otpRecord.iv, otpRecord.tag);
      
      if (decryptedOtp === (otp as string).trim()) {
        await connection!.execute<ResultSetHeader>('DELETE FROM otp_verifications WHERE id = ?', [otpRecord.id]);
        return NextResponse.json({ message: "Email verified successfully!" }, { status: 200 });
      }

      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    return NextResponse.json({ error: "Use 'send' or 'verify'" }, { status: 400 });
  } catch (error) {
    console.error("Warranty OTP error:", error);
    return NextResponse.json({ error: "Failed to process OTP" }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
