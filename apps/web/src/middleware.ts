import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/stadium-owner")) {
    const next = pathname.replace("/stadium-owner", "/owner");
    return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/stadium-owner/:path*"],
};
