import { notFound } from "next/navigation";
import { AdminStockInForm } from "@/components/admin-stock-in-form";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ProductStockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.query.products.findFirst({ where: and(eq(products.id, id), isNull(products.deletedAt)) });
  if (!product) notFound();
  return <AdminStockInForm initialProductId={id} />;
}
