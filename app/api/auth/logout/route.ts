import { NextResponse } from "next/server";
import { clearAuthCookie, deleteAuthSession } from "@/lib/auth-session";

export async function POST(request: Request) {
  await deleteAuthSession(request);
  return clearAuthCookie(NextResponse.json({ success: true }));
}
