import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const STATE_COOKIE = "google_oauth_state";
const STATE_MAX_AGE = 10 * 60;

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    const url = new URL("/masuk", request.url);
    url.searchParams.set("error", "google_misconfigured");
    return NextResponse.redirect(url);
  }

  const state = randomBytes(24).toString("hex");
  const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("access_type", "online");
  authorizeUrl.searchParams.set("prompt", "select_account");
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl.toString());
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_MAX_AGE,
  });
  return response;
}
