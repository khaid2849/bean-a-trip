import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let minioUrl: URL;
  try {
    minioUrl = new URL(url);
  } catch {
    return new NextResponse("Invalid url parameter", { status: 400 });
  }

  // Only proxy requests to MinIO (port 9000)
  if (minioUrl.port !== "9000") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const upstream = await fetch(url);
  if (!upstream.ok) {
    return new NextResponse("Upstream error", { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const contentDisposition = upstream.headers.get("content-disposition");
  const body = await upstream.arrayBuffer();

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=3600",
  };
  if (contentDisposition) {
    headers["Content-Disposition"] = contentDisposition;
  }

  return new NextResponse(body, { headers });
}
