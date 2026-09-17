import { randomBytes } from "node:crypto";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { db } from "@/db/client";
import { magicLinks } from "@/db/schema";
import { SEO_BASE } from "@/lib/seo";
import { getSiteSettings } from "@/lib/queries/site-settings";

const lifetimeMs = 24 * 60 * 60 * 1_000;
const codeAlphabet = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
const codeLength = 10;
const codePattern = new RegExp(`^[${codeAlphabet}]{${codeLength}}$`);

function baseUrl(): string {
  return SEO_BASE.replace(/\/+$/, "");
}

function fallbackLink(orderId: string): string {
  return `${baseUrl()}/admin/pesanan?order=${encodeURIComponent(orderId)}`;
}

function generateCode(): string {
  const bytes = randomBytes(codeLength);
  let code = "";
  for (let index = 0; index < codeLength; index += 1) {
    code += codeAlphabet[bytes[index] % codeAlphabet.length];
  }
  return code;
}

export async function issueAdminMagicLink(orderId: string): Promise<string> {
  try {
    const settings = await getSiteSettings();
    const phone = settings?.whatsappNumber?.trim() ?? "";
    const code = generateCode();
    const now = new Date();
    await db.delete(magicLinks).where(lt(magicLinks.expiresAt, new Date(now.getTime() - lifetimeMs)));
    await db.insert(magicLinks).values({
      id: code,
      phone,
      orderId,
      expiresAt: new Date(now.getTime() + lifetimeMs),
    });
    return `${baseUrl()}/m/${code}`;
  } catch (error) {
    console.error("Failed to issue admin magic link", error);
    return fallbackLink(orderId);
  }
}

export async function consumeAdminMagicLink(
  code: string,
): Promise<{ orderId: string; phone: string } | null> {
  if (!codePattern.test(code)) return null;

  const rows = await db
    .update(magicLinks)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(magicLinks.id, code),
        isNull(magicLinks.usedAt),
        gt(magicLinks.expiresAt, new Date()),
      ),
    )
    .returning({ orderId: magicLinks.orderId, phone: magicLinks.phone });

  return rows[0] ?? null;
}
