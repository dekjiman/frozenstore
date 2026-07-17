import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-session";

const developmentAdminKey = "raf-store-admin-development-key";

export async function requireAdmin(request: Request) {
  const authenticated = await getAuthenticatedUser(request);
  if (authenticated?.user.role === "admin") return null;

  const expectedKey = process.env.ADMIN_API_KEY ??
    (process.env.NODE_ENV === "production" ? null : developmentAdminKey);

  if (!expectedKey) {
    return NextResponse.json(
      { error: { code: "ADMIN_AUTH_NOT_CONFIGURED", message: "Admin API key belum dikonfigurasi" } },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${expectedKey}`) {
    return NextResponse.json(
      { error: { code: "ADMIN_UNAUTHORIZED", message: "Akses admin diperlukan" } },
      { status: 401 },
    );
  }

  return null;
}
