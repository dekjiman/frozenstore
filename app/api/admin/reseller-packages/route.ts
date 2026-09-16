import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { resellerPackages } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { validateResellerPackage } from "@/lib/reseller-packages";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const rows = await db
      .select()
      .from(resellerPackages)
      .orderBy(asc(resellerPackages.sortOrder));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Failed to list reseller packages", error);
    return NextResponse.json(
      { error: { code: "RESELLER_PACKAGES_LIST_FAILED", message: "Gagal memuat paket kemitraan" } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const validation = validateResellerPackage(body);
    if (!validation.ok) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Data paket tidak valid", fields: validation.errors } },
        { status: 400 },
      );
    }

    const { values } = validation;
    const slug = values.slug as string;
    const existing = await db
      .select({ id: resellerPackages.id })
      .from(resellerPackages)
      .where(eq(resellerPackages.slug, slug));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: { code: "SLUG_TAKEN", message: "Slug sudah digunakan paket lain", fields: { slug: "Slug sudah digunakan" } } },
        { status: 409 },
      );
    }

    const id = randomUUID();
    await db.insert(resellerPackages).values({ id, ...values, sortOrder: values.sortOrder ?? 0 });

    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to create reseller package", error);
    return NextResponse.json(
      { error: { code: "RESELLER_PACKAGE_CREATE_FAILED", message: "Gagal membuat paket kemitraan" } },
      { status: 500 },
    );
  }
}