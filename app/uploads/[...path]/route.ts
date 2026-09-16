import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const UPLOAD_ROOT = resolve(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  if (!segments || segments.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const relative = segments.join("/");
  if (
    relative.includes("\0") ||
    relative.split("/").some((segment) => segment === "..")
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const filePath = resolve(UPLOAD_ROOT, relative);
  if (filePath !== UPLOAD_ROOT && !filePath.startsWith(UPLOAD_ROOT + sep)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const buffer = await readFile(filePath);
    const contentType =
      CONTENT_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}