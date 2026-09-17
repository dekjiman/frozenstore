import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { attachAuthCookie, createAuthSession } from "@/lib/auth-session";
import { consumeAdminMagicLink } from "@/lib/magic-link";
import { SEO_BASE } from "@/lib/seo";
import { normalizeWaNumber } from "@/lib/wa";

export const runtime = "nodejs";

type MagicLinkContext = {
  params: Promise<{ code: string }>;
};

export async function GET(_request: Request, { params }: MagicLinkContext) {
  const { code } = await params;
  const link = await consumeAdminMagicLink(code);
  if (!link) {
    return NextResponse.json(
      {
        error: {
          code: "MAGIC_LINK_INVALID",
          message: "Tautan tidak valid, sudah dipakai, atau kedaluwarsa. Silakan masuk dengan email dan password.",
        },
      },
      { status: 401 },
    );
  }

  const admins = await db.select().from(users).where(eq(users.role, "admin"));
  const targetPhone = link.phone ? normalizeWaNumber(link.phone) : "";
  const user =
    (targetPhone
      ? admins.find((admin) => admin.phone && normalizeWaNumber(admin.phone) === targetPhone)
      : undefined) ?? admins[0];

  if (!user) {
    return NextResponse.json(
      { error: { code: "MAGIC_LINK_NO_ADMIN", message: "Akun admin tidak ditemukan di database." } },
      { status: 503 },
    );
  }

  const session = await createAuthSession(user.id);
  const destination = `${SEO_BASE.replace(/\/+$/, "")}/admin/pesanan?order=${encodeURIComponent(link.orderId)}`;
  const response = NextResponse.redirect(destination);
  attachAuthCookie(response, session);
  return response;
}
