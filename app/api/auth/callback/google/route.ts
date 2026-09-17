import { randomBytes, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { attachAuthCookie, createAuthSession } from "@/lib/auth-session";
import { COOKIE_SECURE } from "@/lib/cookie-security";
import { SEO_BASE } from "@/lib/seo";

export const runtime = "nodejs";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const STATE_COOKIE = "google_oauth_state";

type GoogleTokenPayload = {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const clearState = NextResponse.redirect(new URL("/masuk?error=google_failed", SEO_BASE));
  clearState.cookies.set(STATE_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: COOKIE_SECURE, expires: new Date(0), path: "/" });

  if (!code || !state) return clearState;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const signedState = cookieHeader
    .split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === STATE_COOKIE)?.[1];
  if (!signedState || decodeURIComponent(signedState) !== state) return clearState;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return clearState;

  let tokenPayload: GoogleTokenPayload;
  try {
    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });
    if (!tokenResponse.ok) return clearState;
    tokenPayload = (await tokenResponse.json()) as GoogleTokenPayload;
  } catch {
    return clearState;
  }

  let googleUser: GoogleUserInfo;
  try {
    const infoResponse = await fetch(USERINFO_URL, {
      headers: { authorization: `Bearer ${tokenPayload.access_token}` },
      cache: "no-store",
    });
    if (!infoResponse.ok) return clearState;
    googleUser = (await infoResponse.json()) as GoogleUserInfo;
  } catch {
    return clearState;
  }

  if (!googleUser.email || !googleUser.email_verified) return clearState;

  const email = googleUser.email.toLowerCase();
  let user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    const now = new Date();
    const id = randomUUID();
    user = {
      id,
      role: "customer",
      name: googleUser.name,
      email,
      emailVerified: true,
      image: googleUser.picture ?? null,
      phone: null,
      passwordHash: null,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(users).values(user);
  }
  const session = await createAuthSession(user.id);
  const response = NextResponse.redirect(new URL(user.role === "admin" ? "/admin" : "/akun", SEO_BASE));
  attachAuthCookie(response, session);
  return response;
}
