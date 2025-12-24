import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({ admin }, { status: 200 });
  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify admin" },
      { status: 500 }
    );
  }
}
