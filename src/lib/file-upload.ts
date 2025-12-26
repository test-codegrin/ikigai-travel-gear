import type { UploadResponse } from "imagekit/dist/libs/interfaces";
import imagekit from "./imagekit";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB

export async function saveFile(
  file: File,
  type: "invoice" | "warranty-card"
): Promise<{ url: string; fileId: string }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 5MB limit");
  }

  // Convert File to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Determine folder path based on type
  const folder = type === "invoice" ? "/invoices" : "/warranty-cards";

  try {
    // Upload to ImageKit
    const uploadResponse: UploadResponse = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: folder,
      useUniqueFileName: true, // Automatically generates unique filename
    });

    // Return both URL and fileId for future deletion
    return {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    };
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw new Error("Failed to upload file to ImageKit");
  }
}

export async function deleteFile(fileId: string) {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error("Error deleting file from ImageKit:", error);
    throw error;
  }
}
