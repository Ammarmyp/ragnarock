/**
 * Next.js 16 Proxy (formerly middleware) — Better Auth auth gate.
 *
 * Per Better Auth's Next.js 16 integration guide, we use the Edge-level
 * `getSessionCookie` helper for an optimistic cookie-existence check.
 * Real session validation happens server-side on the NestJS API.
 *
 * Gates:
 * - `/dashboard/*` requires a session cookie; otherwise redirect to /sign-in.
 * - `/sign-in`, `/sign-up`, `/verify-otp`, `/forgot-password`: if already
 *   signed in, bounce to /dashboard/projects.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_PAGE_PATHS = new Set([
  "/sign-in",
  "/sign-up",
  "/verify-otp",
  "/forgot-password",
]);

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGE_PATHS.has(pathname);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);
  const hasSessionHint = request.cookies.get("ba_session_hint")?.value === "1";
  const hasAuthSignal = Boolean(sessionCookie || hasSessionHint);
  const hasVerifiedSession = Boolean(sessionCookie);

  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/account")) && !hasAuthSignal) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  // Do not bounce from auth pages based only on the client-side hint cookie.
  if (hasVerifiedSession && isAuthPage(pathname)) {
    return NextResponse.redirect(new URL("/dashboard/projects", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account",
    "/account/:path*",
    "/sign-in",
    "/sign-up",
    "/verify-otp",
    "/forgot-password",
  ],
};
