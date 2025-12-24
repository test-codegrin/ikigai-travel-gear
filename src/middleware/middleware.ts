import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get admin token from cookies
  const token = request.cookies.get("admin-token")?.value;

  // Handle /admin route
  if (pathname === "/admin") {
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Protect admin dashboard routes
  if (pathname.startsWith("/admin") && !pathname.includes("/login")) {
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Redirect /admin/login to dashboard if already logged in
  if (pathname === "/admin/login") {
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
