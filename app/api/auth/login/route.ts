import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { attachAuthCookie, createAuthSession } from "@/lib/auth-session";
import { verifyPassword } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: { code: "INVALID_CREDENTIALS", message: "Email atau password salah" } }, { status: 401 });

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    const validPassword = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;
    if (!user || !validPassword) return NextResponse.json({ error: { code: "INVALID_CREDENTIALS", message: "Email atau password salah" } }, { status: 401 });

    const session = await createAuthSession(user.id);
    return attachAuthCookie(NextResponse.json({ user: { id: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone } }), session);
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } }, { status: 400 });
    console.error("Failed to login", error);
    return NextResponse.json({ error: { code: "LOGIN_FAILED", message: "Gagal masuk" } }, { status: 500 });
  }
}
