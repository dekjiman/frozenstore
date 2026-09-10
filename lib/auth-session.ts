import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { authSessions, users } from "@/db/schema";

export const AUTH_SESSION_COOKIE = "raf_auth_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim().split("="))
    .find(([cookieName]) => cookieName === name)?.[1];
}

export async function createAuthSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionDurationSeconds * 1000);
  await db.insert(authSessions).values({
    id: randomUUID(), userId, tokenHash: hashToken(token), expiresAt, createdAt: now,
  });
  return { token, expiresAt };
}

export function attachAuthCookie(
  response: NextResponse,
  session: { token: string; expiresAt: Date },
) {
  response.cookies.set(AUTH_SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: session.expiresAt,
    path: "/",
  });
  return response;
}

export async function getAuthenticatedUser(request: Request) {
  const token = readCookie(request, AUTH_SESSION_COOKIE);
  if (!token) return null;
  const result = await db
    .select({ session: authSessions, user: users })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(and(eq(authSessions.tokenHash, hashToken(decodeURIComponent(token))), gt(authSessions.expiresAt, new Date())))
    .limit(1);
  return result[0] ?? null;
}

export async function deleteAuthSession(request: Request) {
  const token = readCookie(request, AUTH_SESSION_COOKIE);
  if (token) await db.delete(authSessions).where(eq(authSessions.tokenHash, hashToken(decodeURIComponent(token))));
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_SESSION_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}
