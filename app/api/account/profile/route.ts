import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-session";

function profilePayload(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    phone: user.phone,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  const result = await getAuthenticatedUser(request);
  if (!result) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu" } }, { status: 401 });
  return NextResponse.json({ user: profilePayload(result.user) });
}

export async function PATCH(request: Request) {
  try {
    const result = await getAuthenticatedUser(request);
    if (!result) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu" } }, { status: 401 });

    const body = (await request.json()) as Record<string, unknown>;
    const updates: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };
    const errors: Record<string, string> = {};
    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length < 3 || name.length > 100) errors.name = "Nama harus 3–100 karakter";
      else updates.name = name;
    }
    if (body.email !== undefined) {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email tidak valid";
      else if (email !== result.user.email) {
        updates.email = email;
        updates.emailVerified = false;
      }
    }
    if (body.phone !== undefined) {
      const phone = typeof body.phone === "string" ? body.phone.replace(/[\s-]/g, "") : "";
      if (!/^(?:\+62|62|0)8\d{8,12}$/.test(phone)) errors.phone = "Nomor WhatsApp tidak valid";
      else updates.phone = phone;
    }
    if (body.image !== undefined) {
      const image = typeof body.image === "string" ? body.image.trim() : "";
      if (image && !/^https?:\/\//.test(image)) errors.image = "URL gambar tidak valid";
      else updates.image = image || null;
    }

    if (Object.keys(errors).length > 0) return NextResponse.json({ error: { code: "INVALID_PROFILE", message: "Data profil tidak valid", fields: errors } }, { status: 400 });

    const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, result.user.id)).returning();
    return NextResponse.json({ user: profilePayload(updatedUser) });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } }, { status: 400 });
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) return NextResponse.json({ error: { code: "PROFILE_CONFLICT", message: "Email atau nomor WhatsApp sudah digunakan" } }, { status: 409 });
    console.error("Failed to update profile", error);
    return NextResponse.json({ error: { code: "PROFILE_UPDATE_FAILED", message: "Gagal mengubah profil" } }, { status: 500 });
  }
}
