import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880"); 

export async function ensureUploadDir() {
  const invoiceDir = path.join(process.cwd(), UPLOAD_DIR, "invoices");
  const warrantyCardDir = path.join(process.cwd(), UPLOAD_DIR, "warranty-cards");
  
  await fs.mkdir(invoiceDir, { recursive: true });
  await fs.mkdir(warrantyCardDir, { recursive: true });
}

export async function saveFile(
  file: File,
  type: "invoice" | "warranty-card"
): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 5MB limit");
  }

  await ensureUploadDir();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExt = path.extname(file.name);
  const randomName = randomBytes(16).toString("hex");
  const fileName = `${randomName}${fileExt}`;

  const subDir = type === "invoice" ? "invoices" : "warranty-cards";
  const filePath = path.join(process.cwd(), UPLOAD_DIR, subDir, fileName);

  await fs.writeFile(filePath, buffer);

  return `/uploads/${subDir}/${fileName}`;
}

export async function deleteFile(fileUrl: string) {
  try {
    const filePath = path.join(process.cwd(), "public", fileUrl);
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}
