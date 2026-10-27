import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  // Supabase's site_url points at "/"; a Google sign-in lands the OAuth
  // code there instead of on /auth/callback, so nothing exchanges it.
  if (pathname === "/" && code) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    url.search = `?code=${encodeURIComponent(code)}&next=${encodeURIComponent("/app")}`;
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|ico|woff2?)$).*)"],
};
