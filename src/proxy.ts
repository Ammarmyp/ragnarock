import { NextResponse, type NextRequest } from "next/server";
import { LAST_ACTIVE_ORGANIZATION_COOKIE_NAME } from "@/lib/organization/last-active-organization-cookie";

const authPages = new Set(["/sign-in", "/sign-up", "/verify-otp", "/forgot-password"]);
const protectedPrefixes = ["/dashboard"];
const ORG_CREATE_PATH = "/dashboard/organization/create";
const ORG_SELECT_PATH = "/dashboard/organization/select";
const ORG_ACCEPT_INVITATION_PATH = "/dashboard/accept-invitation";

function getSessionFetchOrigin(request: NextRequest): string {
  const base = (process.env.NEXT_PUBLIC_AUTH_URL ?? "").replace(/\/$/, "");
  return base || request.nextUrl.origin;
}

type SessionPayload = {
  user?: unknown;
  session?: {
    activeOrganizationId?: string | null;
  } | null;
};

async function getSessionState(
  request: NextRequest,
): Promise<{ authenticated: boolean; hasActiveOrganization: boolean }> {
  try {
    const cookie = request.headers.get("cookie");
    if (!cookie) {
      return { authenticated: false, hasActiveOrganization: false };
    }

    const sessionUrl = `${getSessionFetchOrigin(request)}/api/auth/get-session`;
    const response = await fetch(sessionUrl, {
      method: "GET",
      headers: {
        cookie,
      },
    });

    if (!response.ok) {
      return { authenticated: false, hasActiveOrganization: false };
    }

    const payload = (await response.json()) as SessionPayload;
    const authenticated = Boolean(payload?.user && payload?.session);
    const hasActiveOrganization = Boolean(payload?.session?.activeOrganizationId);

    return { authenticated, hasActiveOrganization };
  } catch {
    return { authenticated: false, hasActiveOrganization: false };
  }
}

type OrgListItem = { id: string };

async function fetchOrganizationList(request: NextRequest): Promise<OrgListItem[] | null> {
  try {
    const cookie = request.headers.get("cookie") ?? "";
    const url = `${getSessionFetchOrigin(request)}/api/auth/organization/list`;
    const response = await fetch(url, {
      method: "GET",
      headers: { cookie },
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as unknown;
    return Array.isArray(data) ? (data as OrgListItem[]) : null;
  } catch {
    return null;
  }
}

async function postSetActiveOrganization(
  request: NextRequest,
  organizationId: string,
): Promise<Response> {
  const cookie = request.headers.get("cookie") ?? "";
  const url = `${getSessionFetchOrigin(request)}/api/auth/organization/set-active`;
  return fetch(url, {
    method: "POST",
    headers: {
      cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ organizationId }),
  });
}

function copySetCookiesFromResponse(from: Response, to: NextResponse) {
  const list = from.headers.getSetCookie?.();
  if (list && list.length > 0) {
    for (const c of list) {
      to.headers.append("Set-Cookie", c);
    }
    return;
  }
  const single = from.headers.get("set-cookie");
  if (single) {
    to.headers.append("Set-Cookie", single);
  }
}

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const segments = cookieHeader.split(";");
  for (const segment of segments) {
    const part = segment.trim();
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key !== name) continue;
    return part.slice(eq + 1).trim() || null;
  }
  return null;
}

function resolveRedirectTargetAfterSetActive(request: NextRequest): URL {
  const path = request.nextUrl.pathname;
  if (path === ORG_CREATE_PATH || path === ORG_SELECT_PATH) {
    return new URL("/dashboard", request.url);
  }
  return request.nextUrl.clone();
}

function appendPersistedLastActiveOrgCookie(response: NextResponse, organizationId: string) {
  const maxAge = 60 * 60 * 24 * 365;
  response.headers.append(
    "Set-Cookie",
    `${LAST_ACTIVE_ORGANIZATION_COOKIE_NAME}=${encodeURIComponent(organizationId)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`,
  );
}

/**
 * Next.js [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) —
 * auth redirects, session/org bootstrap (replaces deprecated `middleware`).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = authPages.has(pathname);
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isAuthPage && !isProtectedRoute) {
    return NextResponse.next();
  }

  const { authenticated, hasActiveOrganization } = await getSessionState(request);

  if (isProtectedRoute && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set(
      "redirectTo",
      pathname + (request.nextUrl.search || ""),
    );
    return NextResponse.redirect(url);
  }

  if (isAuthPage && authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!authenticated || !isProtectedRoute) {
    return NextResponse.next();
  }

  if (pathname === ORG_ACCEPT_INVITATION_PATH) {
    return NextResponse.next();
  }

  const isOrgCreatePath = pathname === ORG_CREATE_PATH;
  const isOrgSelectPath = pathname === ORG_SELECT_PATH;

  if (hasActiveOrganization) {
    if (isOrgCreatePath || isOrgSelectPath) {
      const url = new URL("/dashboard", request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const organizations = await fetchOrganizationList(request);

  if (organizations === null) {
    if (isOrgSelectPath) {
      return NextResponse.next();
    }
    const selectUrl = new URL(ORG_SELECT_PATH, request.url);
    selectUrl.searchParams.set(
      "redirectTo",
      pathname + (request.nextUrl.search || ""),
    );
    return NextResponse.redirect(selectUrl);
  }

  if (organizations.length === 0) {
    if (isOrgCreatePath) {
      return NextResponse.next();
    }
    if (isOrgSelectPath) {
      return NextResponse.redirect(new URL(ORG_CREATE_PATH, request.url));
    }
    return NextResponse.redirect(new URL(ORG_CREATE_PATH, request.url));
  }

  if (organizations.length === 1) {
    const res = await postSetActiveOrganization(request, organizations[0].id);
    if (!res.ok) {
      if (!isOrgSelectPath) {
        return NextResponse.redirect(new URL(ORG_SELECT_PATH, request.url));
      }
      return NextResponse.next();
    }
    const redirectTarget = resolveRedirectTargetAfterSetActive(request);
    const out = NextResponse.redirect(redirectTarget);
    copySetCookiesFromResponse(res, out);
    appendPersistedLastActiveOrgCookie(out, organizations[0].id);
    return out;
  }

  const cookieRaw = getCookieValue(
    request.headers.get("cookie"),
    LAST_ACTIVE_ORGANIZATION_COOKIE_NAME,
  );
  let restoredId: string | null = null;
  if (cookieRaw) {
    try {
      restoredId = decodeURIComponent(cookieRaw);
    } catch {
      restoredId = cookieRaw;
    }
  }
  const validIds = new Set(organizations.map((o) => o.id));
  const restoredFromCookie = restoredId && validIds.has(restoredId) ? restoredId : null;

  if (restoredFromCookie) {
    const res = await postSetActiveOrganization(request, restoredFromCookie);
    if (res.ok) {
      const redirectTarget = resolveRedirectTargetAfterSetActive(request);
      const out = NextResponse.redirect(redirectTarget);
      copySetCookiesFromResponse(res, out);
      appendPersistedLastActiveOrgCookie(out, restoredFromCookie);
      return out;
    }
  }

  if (isOrgSelectPath) {
    return NextResponse.next();
  }

  const selectUrl = new URL(ORG_SELECT_PATH, request.url);
  selectUrl.searchParams.set("redirectTo", pathname + (request.nextUrl.search || ""));
  return NextResponse.redirect(selectUrl);
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/verify-otp",
    "/forgot-password",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
