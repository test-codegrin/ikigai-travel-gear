import type { UploadResponse } from "imagekit/dist/libs/interfaces";
import imagekit from "./imagekit";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB
const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE || "10485760"); // 10MB

export async function saveFile(
  file: File,
  type: "invoice" | "warranty-card" | "claim-photo" | "claim-video"
): Promise<{ url: string; fileId: string }> {
  // Validate file size based on type
  const maxSize = type === "claim-video" ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
  
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }

  // Convert File to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Determine folder path based on type
  let folder: string;
  switch (type) {
    case "invoice":
      folder = "/invoices";
      break;
    case "warranty-card":
      folder = "/warranty-cards";
      break;
    case "claim-photo":
      folder = "/claims/photos";
      break;
    case "claim-video":
      folder = "/claims/videos";
      break;
    default:
      folder = "/uploads";
  }

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
