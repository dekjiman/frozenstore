import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getMediaStorage, isAllowedMimeType, getMaxFileSize, getMediaType } from "@/lib/media-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "misc";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: { code: "NO_FILE", message: "Tidak ada file yang diunggah" } },
        { status: 400 },
      );
    }

    const mimeType = file.type;
    if (!isAllowedMimeType(mimeType)) {
      return NextResponse.json(
        { error: { code: "INVALID_TYPE", message: `Tipe file tidak didukung. Yang diperbolehkan: JPEG, PNG, WebP, AVIF, MP4` } },
        { status: 400 },
      );
    }

    const maxSize = getMaxFileSize(mimeType);
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: { code: "FILE_TOO_LARGE", message: `Ukuran file melebihi batas ${maxMB}MB` } },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getMediaStorage();
    const result = await storage.upload({
      buffer,
      filename: file.name,
      mimeType,
      folder,
    });

    return NextResponse.json({
      data: {
        url: result.url,
        width: result.width ?? null,
        height: result.height ?? null,
        mimeType: result.mimeType,
        fileSizeBytes: result.fileSizeBytes,
        mediaType: getMediaType(mimeType),
      },
    });
  } catch (error) {
    console.error("Upload failed", error);
    return NextResponse.json(
      { error: { code: "UPLOAD_FAILED", message: "Gagal mengunggah file" } },
      { status: 500 },
    );
  }
}
