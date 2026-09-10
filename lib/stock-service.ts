import { randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { products, stockMovements } from "@/db/schema";

type TransactionCallback = Parameters<typeof db.transaction>[0];
type DatabaseTransaction = Parameters<TransactionCallback>[0];

type OrderStockItem = {
  productId: string;
  quantity: number;
};

type DeductOrderStockInput = {
  orderNumber: string;
  items: OrderStockItem[];
  createdAt?: Date;
  createdBy?: string | null;
};

export class StockUnavailableError extends Error {
  readonly code = "STOCK_UNAVAILABLE";

  constructor(
    message: string,
    readonly productId: string,
    readonly requested: number,
    readonly available: number,
  ) {
    super(message);
    this.name = "StockUnavailableError";
  }
}

export async function deductStockForOrder(
  transaction: DatabaseTransaction,
  input: DeductOrderStockInput,
) {
  const quantities = new Map<string, number>();
  for (const item of input.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  const createdAt = input.createdAt ?? new Date();
  const movements = [];

  for (const [productId, quantity] of quantities) {
    const existingMovement = await transaction.query.stockMovements.findFirst({
      where: and(
        eq(stockMovements.productId, productId),
        eq(stockMovements.type, "out"),
        eq(stockMovements.reference, input.orderNumber),
      ),
    });
    if (existingMovement) {
      movements.push(existingMovement);
      continue;
    }

    const product = await transaction.query.products.findFirst({
      where: and(eq(products.id, productId), isNull(products.deletedAt)),
    });
    const available = product?.currentStock ?? 0;
    if (!product || !product.isActive || available < quantity) {
      throw new StockUnavailableError(
        `Stok produk ${product?.name ?? productId} tidak mencukupi`,
        productId,
        quantity,
        available,
      );
    }

    const stockAfter = available - quantity;
    const updateResult = await transaction
      .update(products)
      .set({ currentStock: stockAfter, updatedAt: createdAt })
      .where(
        and(
          eq(products.id, productId),
          eq(products.currentStock, available),
          eq(products.isActive, true),
          isNull(products.deletedAt),
        ),
      )
      .execute();
    if (Number(updateResult.count) !== 1) {
      throw new StockUnavailableError(
        `Stok produk ${product.name} berubah, silakan coba lagi`,
        productId,
        quantity,
        available,
      );
    }

    const movement = {
      id: randomUUID(),
      productId,
      type: "out" as const,
      quantity,
      stockBefore: available,
      stockAfter,
      reason: "Pesanan pelanggan",
      reference: input.orderNumber,
      createdBy: input.createdBy ?? null,
      createdAt,
    };
    await transaction.insert(stockMovements).values(movement).execute();
    movements.push(movement);
  }

  return movements;
}