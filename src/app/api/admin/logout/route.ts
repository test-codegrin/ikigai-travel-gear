import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // ✅ Method 1: Use cookies().delete() - MOST RELIABLE
    const cookieStore = await cookies();
    
    // Delete multiple possible token names
    cookieStore.delete("admin_token");
    cookieStore.delete("admin-token"); 
    cookieStore.delete("admin_token"); 
    cookieStore.delete("token");

    // ✅ Method 2: Manual cookie deletion (backup)
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Delete with EXPIRED date + exact match params
    response.cookies.set({
      name: "admin_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0), // ✅ CRITICAL: Past date
    });

    // Delete alternate names too
    response.cookies.set({
      name: "admin-token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    // ✅ Anti-cache headers
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    
    // Even on error, try to delete cookies
    const response = NextResponse.json(
      { error: "Logout completed (cookies cleared)" },
      { status: 200 } // ✅ Still 200 to trigger client cleanup
    );
    
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    cookieStore.delete("admin-token");
    
    return response;
  }
}
