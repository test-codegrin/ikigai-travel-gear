import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { saveFile } from "@/lib/file-upload";

// Generate claim external ID
function generateClaimExternalId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `CLM-${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const warrantyId = formData.get("warranty_id") as string;
    const defectDescription = formData.get("defect_description") as string;
    const photoFile = formData.get("photo_file") as File;
    const videoFile = formData.get("video_file") as File | null;

    if (!warrantyId || !defectDescription || !photoFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if there's an active claim
    const existingClaims = (await query(
      `SELECT c.*, cs.name as claim_status
       FROM claims c
       LEFT JOIN claim_statuses cs ON c.claim_status_id = cs.id
       WHERE c.warranty_id = ? AND c.is_deleted = 0
       ORDER BY c.claim_register_date DESC
       LIMIT 1`,
      [parseInt(warrantyId)]
    )) as RowDataPacket[];

    if (existingClaims && existingClaims.length > 0) {
      const existingClaim = existingClaims[0];
      if (
        existingClaim.claim_status === "pending" ||
        existingClaim.claim_status === "under_review"
      ) {
        return NextResponse.json(
          {
            error:
              "You already have an active claim. Please wait for it to be completed.",
          },
          { status: 400 }
        );
      }
    }

    // Upload photo using saveFile utility
    const photoUpload = await saveFile(photoFile, "claim-photo");

    let videoUrl = null;
    let videoFileId = null;
    if (videoFile) {
      const videoUpload = await saveFile(videoFile, "claim-video");
      videoUrl = videoUpload.url;
      videoFileId = videoUpload.fileId;
    }

    // Generate claim external ID
    const claimExternalId = generateClaimExternalId();

    // Get pending status ID
    const statuses = (await query(
      `SELECT id FROM claim_statuses WHERE name = 'under_review' AND is_deleted = 0`
    )) as RowDataPacket[];

    if (!statuses || statuses.length === 0) {
      throw new Error("Claim status not found");
    }

    const pendingStatusId = statuses[0].id;

    // Insert claim into database
    const result = (await query(
      `INSERT INTO claims 
       (warranty_id, claim_external_id, defect_description, photo_url, video_url, claim_status_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        parseInt(warrantyId),
        claimExternalId,
        defectDescription,
        photoUpload.url,
        videoUrl,
        pendingStatusId,
      ]
    )) as ResultSetHeader;


    return NextResponse.json(
      {
        message: "Claim submitted successfully",
        claim_external_id: claimExternalId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Claim submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit claim" },
      { status: 500 }
    );
  }
}
