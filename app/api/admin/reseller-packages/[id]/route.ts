import { and, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { resellerPackages } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { validateResellerPackage } from "@/lib/reseller-packages";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateResellerPackage(body, { partial: true });
    if (!validation.ok) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Data paket tidak valid", fields: validation.errors } },
        { status: 400 },
      );
    }
    const { values } = validation;

    const existing = await db.select().from(resellerPackages).where(eq(resellerPackages.id, id));
    if (existing.length === 0) {
      return NextResponse.json(
        { error: { code: "RESELLER_PACKAGE_NOT_FOUND", message: "Paket kemitraan tidak ditemukan" } },
        { status: 404 },
      );
    }
    const current = existing[0];

    if (values.slug && values.slug !== current.slug) {
      const clash = await db
        .select({ id: resellerPackages.id })
        .from(resellerPackages)
        .where(and(eq(resellerPackages.slug, values.slug), ne(resellerPackages.id, id)));
      if (clash.length > 0) {
        return NextResponse.json(
          { error: { code: "SLUG_TAKEN", message: "Slug sudah digunakan paket lain", fields: { slug: "Slug sudah digunakan" } } },
          { status: 409 },
        );
      }
    }

    const merged: Record<string, unknown> = { ...current, ...values };
    if (
      (values.discountMinPercent !== undefined || values.discountMaxPercent !== undefined) &&
      (Number(merged.discountMaxPercent) < Number(merged.discountMinPercent))
    ) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Data paket tidak valid", fields: { discountMaxPercent: "Diskon maksimal tidak boleh lebih kecil dari diskon minimal" } } },
        { status: 400 },
      );
    }
    if (
      (values.marginMin !== undefined || values.marginMax !== undefined) &&
      (Number(merged.marginMax) < Number(merged.marginMin))
    ) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Data paket tidak valid", fields: { marginMax: "Margin maksimal tidak boleh lebih kecil dari margin minimal" } } },
        { status: 400 },
      );
    }

    await db.update(resellerPackages).set(values).where(eq(resellerPackages.id, id));

    return NextResponse.json({ data: { id } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to update reseller package", error);
    return NextResponse.json(
      { error: { code: "RESELLER_PACKAGE_UPDATE_FAILED", message: "Gagal mengupdate paket kemitraan" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    await db.delete(resellerPackages).where(eq(resellerPackages.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete reseller package", error);
    return NextResponse.json(
      { error: { code: "RESELLER_PACKAGE_DELETE_FAILED", message: "Gagal menghapus paket kemitraan" } },
      { status: 500 },
    );
  }
}