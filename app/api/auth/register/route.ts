import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const key = `register:${clientIp(request)}`;
    if (isRateLimited(key, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: { code: "TOO_MANY_ATTEMPTS", message: "Terlalu banyak registrasi, coba lagi nanti" } },
        { status: 429 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.replace(/[\s-]/g, "") : "";
    const password = typeof body.password === "string" ? body.password : "";
    const errors: Record<string, string> = {};

    if (name.length < 3 || name.length > 100) errors.name = "Nama harus 3–100 karakter";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email tidak valid";
    if (!/^(?:\+62|62|0)8\d{8,12}$/.test(phone)) errors.phone = "Nomor WhatsApp tidak valid";
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      errors.password = "Password minimal 8 karakter dan harus berisi huruf besar, angka, serta simbol";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: { code: "INVALID_REGISTRATION", message: "Data pendaftaran tidak valid", fields: errors } },
        { status: 400 },
      );
    }

    const now = new Date();
    const user = {
      id: randomUUID(),
      role: "customer" as const,
      name,
      email,
      emailVerified: false,
      phone,
      passwordHash: await hashPassword(password),
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(users).values(user);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
          phone: user.phone,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: { code: "ACCOUNT_EXISTS", message: "Email atau nomor WhatsApp sudah terdaftar" } },
        { status: 409 },
      );
    }

    console.error("Failed to register account", error);
    return NextResponse.json(
      { error: { code: "REGISTRATION_FAILED", message: "Gagal membuat akun" } },
      { status: 500 },
    );
  }
}
