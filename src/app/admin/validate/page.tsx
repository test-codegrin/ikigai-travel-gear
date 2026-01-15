import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Quick token validation endpoint
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    // Verify JWT token (your existing logic)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
