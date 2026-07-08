import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const res = await fetch(url);
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
    else if (ext === "doc" || ext === "docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", "inline"); // Force inline viewing

    return new NextResponse(arrayBuffer, { headers });
  } catch (error) {
    console.error("View asset error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
