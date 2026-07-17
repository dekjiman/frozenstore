import { notFound } from "next/navigation";
import { AdminEditProductForm } from "@/components/admin-edit-product-form";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { toProduct } from "@/lib/product-mapper";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await db.query.products.findFirst({ where: and(eq(products.id, id), isNull(products.deletedAt)) });
  if (!row) notFound();
  return <AdminEditProductForm product={toProduct(row)} />;
}
