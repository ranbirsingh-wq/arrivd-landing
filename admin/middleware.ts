import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Skip auth in dev mode for design preview
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Validate token contains the admin password
  try {
    const decoded = Buffer.from(token, "base64").toString();
    if (!decoded.includes(process.env.ADMIN_PASSWORD!)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/subscribers/:path*", "/api/send-email/:path*"],
};
