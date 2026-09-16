import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-session";

export async function GET(request: Request) {
  const result = await getAuthenticatedUser(request);
  if (!result) return NextResponse.json({ user: null }, { status: 401 });
  const { user } = result;
  return NextResponse.json({ user: { id: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone, image: user.image } });
}
