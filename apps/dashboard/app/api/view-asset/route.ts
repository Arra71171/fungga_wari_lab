import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Validate URL against allowlist to prevent SSRF
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  const ALLOWED_HOSTS = ["res.cloudinary.com", "media.cloudinary.com"];
  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname) || parsedUrl.protocol !== "https:") {
    return new NextResponse("URL host not allowed", { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(parsedUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      return new NextResponse("Failed to fetch asset", { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    
    // Determine content type based on extension
    const ext = url.split('.').pop()?.toLowerCase();
    let contentType = res.headers.get("Content-Type") || "application/octet-stream";
    
    if (ext === "pdf") contentType = "application/pdf";
    else if (ext === "md") contentType = "text/markdown";
    else if (ext === "txt") contentType = "text/plain";
    else if (ext === "doc") contentType = "application/msword";
    else if (ext === "docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", "inline"); // Force inline viewing

    return new NextResponse(arrayBuffer, { headers });
  } catch (error) {
    console.error("View asset error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
