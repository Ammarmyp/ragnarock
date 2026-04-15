import type { NextRequest } from "next/server";

const backendAuthOrigin = (
  process.env.AUTH_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://main.localhost"
).replace(/\/api\/?$/, "");

async function handle(request: NextRequest, params: { all?: string[] }) {
  const segments = params.all ?? [];
  const search = request.nextUrl.search || "";
  const target = `${backendAuthOrigin}/api/auth/${segments.join("/")}${search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const response = await fetch(target, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ all?: string[] }> },
) {
  return handle(request, await context.params);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ all?: string[] }> },
) {
  return handle(request, await context.params);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ all?: string[] }> },
) {
  return handle(request, await context.params);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ all?: string[] }> },
) {
  return handle(request, await context.params);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ all?: string[] }> },
) {
  return handle(request, await context.params);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ all?: string[] }> },
) {
  return handle(request, await context.params);
}
