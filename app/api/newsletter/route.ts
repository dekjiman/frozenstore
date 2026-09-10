import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { newsletterSubscribers } from "@/db/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const source = typeof body.source === "string" ? body.source.trim() : null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: { code: "INVALID_EMAIL", message: "Email tidak valid" } },
        { status: 400 },
      );
    }

    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.email, email),
    });

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json({ data: { id: existing.id, email, status: "active" } });
      }
      await db
        .update(newsletterSubscribers)
        .set({ status: "active", unsubscribedAt: null })
        .where(eq(newsletterSubscribers.id, existing.id));
      return NextResponse.json({ data: { id: existing.id, email, status: "active" } });
    }

    const id = randomUUID();
    const now = new Date();
    await db.insert(newsletterSubscribers).values({
      id,
      email,
      status: "active",
      source,
      subscribedAt: now,
    });

    return NextResponse.json({ data: { id, email, status: "active" } }, { status: 201 });
  } catch (error) {
    console.error("Failed to subscribe newsletter", error);
    return NextResponse.json(
      { error: { code: "NEWSLETTER_FAILED", message: "Gagal berlangganan newsletter" } },
      { status: 500 },
    );
  }
}
