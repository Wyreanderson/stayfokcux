import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifyCookieValue } from "@/lib/auth/session";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/convite/") ||
    pathname.startsWith("/logout")
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE);
  const session = cookie ? verifyCookieValue(cookie.value) : null;

  if (!session) {
    console.log(
      `[proxy] redirect /login (${req.method} ${pathname}) — cookie=${cookie ? "presente_mas_invalido" : "ausente"}`,
    );
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = session;
  const rotaColaborador =
    pathname === "/colaborador" || pathname.startsWith("/colaborador/");
  const rotaApi = pathname.startsWith("/api/");

  if (role === "colaborador") {
    if (!rotaColaborador && !rotaApi) {
      return NextResponse.redirect(new URL("/colaborador", req.url));
    }
  } else if (role === "patrao") {
    if (pathname.startsWith("/admin") || rotaColaborador) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons).*)",
  ],
};
