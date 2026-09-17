import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { attachAuthCookie, createAuthSession } from "@/lib/auth-session";
import { verifyAdminMagicToken } from "@/lib/magic-link";
import { SEO_BASE } from "@/lib/seo";
import { normalizeWaNumber } from "@/lib/wa";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const payload = token ? verifyAdminMagicToken(token) : null;
  if (!payload) {
    return NextResponse.json(
      { error: { code: "MAGIC_LINK_INVALID", message: "Tautan tidak valid atau sudah kedaluwarsa. Silakan masuk dengan email dan password." } },
      { status: 401 },
    );
  }

  const admins = await db.select().from(users).where(eq(users.role, "admin"));
  const user =
    admins.find((admin) => admin.phone && normalizeWaNumber(admin.phone) === payload.phone) ??
    admins[0];

  if (!user) {
    return NextResponse.json(
      { error: { code: "MAGIC_LINK_NO_ADMIN", message: "Akun admin tidak ditemukan di database." } },
      { status: 503 },
    );
  }

  const session = await createAuthSession(user.id);
  const target = `${SEO_BASE.replace(/\/+$/, "")}/admin/pesanan?order=${encodeURIComponent(payload.orderId)}`;
  const response = NextResponse.redirect(target);
  attachAuthCookie(response, session);
  return response;
}