import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "pitflow-auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME);
  const expected = process.env.APP_PASSWORD;

  if (!expected || !cookie || cookie.value !== expected) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons).*)",
  ],
};
