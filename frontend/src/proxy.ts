import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME =
  process.env["SESSION_COOKIE_NAME"] || "velox_session_token";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value?.trim();

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    const targetPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    if (targetPath && targetPath !== "/login") {
      loginUrl.searchParams.set("redirect", targetPath);
    }

    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    redirectResponse.headers.set("Cache-Control", "private, no-store, max-age=0");
    return redirectResponse;
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/partner/:path*", "/dashboard/:path*"],
};
