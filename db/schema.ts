import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull().default(""),
    price: integer("price").notNull(),
    currentStock: integer("current_stock").notNull().default(0),
    imageUrl: text("image_url").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("products_sku_unique").on(table.sku),
    index("products_active_name_index").on(table.isActive, table.name),
    check("products_price_non_negative", sql`${table.price} >= 0`),
    check("products_stock_non_negative", sql`${table.currentStock} >= 0`),
  ],
);

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;

export const carts = sqliteTable(
  "carts",
  {
    id: text("id").primaryKey(),
    sessionKey: text("session_key").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [uniqueIndex("carts_session_key_unique").on(table.sessionKey)],
);

export const cartItems = sqliteTable(
  "cart_items",
  {
    id: text("id").primaryKey(),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("cart_items_cart_product_unique").on(table.cartId, table.productId),
    index("cart_items_cart_id_index").on(table.cartId),
    index("cart_items_product_id_index").on(table.productId),
    check("cart_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export type CartRow = typeof carts.$inferSelect;
export type NewCartRow = typeof carts.$inferInsert;
export type CartItemRow = typeof cartItems.$inferSelect;
export type NewCartItemRow = typeof cartItems.$inferInsert;

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    role: text("role", { enum: ["customer", "admin"] }).notNull().default("customer"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
    image: text("image"),
    phone: text("phone"),
    passwordHash: text("password_hash"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_phone_unique").on(table.phone),
    index("users_role_index").on(table.role),
    check("users_role_valid", sql`${table.role} in ('customer', 'admin')`),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;

export const stockMovements = sqliteTable(
  "stock_movements",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    type: text("type", { enum: ["in", "out", "adjustment"] }).notNull(),
    quantity: integer("quantity").notNull(),
    stockBefore: integer("stock_before").notNull(),
    stockAfter: integer("stock_after").notNull(),
    reason: text("reason").notNull(),
    reference: text("reference"),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("stock_movements_product_created_index").on(
      table.productId,
      table.createdAt,
    ),
    index("stock_movements_type_created_index").on(table.type, table.createdAt),
    index("stock_movements_reference_index").on(table.reference),
    check(
      "stock_movements_type_valid",
      sql`${table.type} in ('in', 'out', 'adjustment')`,
    ),
    check("stock_movements_quantity_positive", sql`${table.quantity} > 0`),
    check("stock_movements_before_non_negative", sql`${table.stockBefore} >= 0`),
    check("stock_movements_after_non_negative", sql`${table.stockAfter} >= 0`),
    check("stock_movements_reason_not_empty", sql`length(trim(${table.reason})) > 0`),
  ],
);

export type StockMovementRow = typeof stockMovements.$inferSelect;
export type NewStockMovementRow = typeof stockMovements.$inferInsert;

export const authSessions = sqliteTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("auth_sessions_token_hash_unique").on(table.tokenHash),
    index("auth_sessions_user_id_index").on(table.userId),
    index("auth_sessions_expires_at_index").on(table.expiresAt),
  ],
);

export type AuthSessionRow = typeof authSessions.$inferSelect;

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNumber: text("order_number").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    customerId: text("customer_id").notNull(),
    recipientName: text("recipient_name").notNull(),
    recipientPhone: text("recipient_phone").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    shippingCity: text("shipping_city").notNull(),
    shippingProvince: text("shipping_province").notNull(),
    shippingPostalCode: text("shipping_postal_code").notNull(),
    shippingNotes: text("shipping_notes"),
    subtotalAmount: integer("subtotal_amount").notNull(),
    shippingAmount: integer("shipping_amount").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    paymentProofUrl: text("payment_proof_url"),
    paymentStatus: text("payment_status", {
      enum: ["pending", "awaiting_verification", "paid", "failed"],
    })
      .notNull()
      .default("pending"),
    orderStatus: text("order_status", {
      enum: ["waiting_payment", "processing", "shipped", "delivered", "cancelled"],
    })
      .notNull()
      .default("waiting_payment"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("orders_order_number_unique").on(table.orderNumber),
    index("orders_user_id_index").on(table.userId),
    index("orders_customer_id_index").on(table.customerId),
    index("orders_payment_status_index").on(table.paymentStatus),
    index("orders_order_status_index").on(table.orderStatus),
    check("orders_subtotal_non_negative", sql`${table.subtotalAmount} >= 0`),
    check("orders_shipping_non_negative", sql`${table.shippingAmount} >= 0`),
    check("orders_total_non_negative", sql`${table.totalAmount} >= 0`),
    check(
      "orders_payment_status_valid",
      sql`${table.paymentStatus} in ('pending', 'awaiting_verification', 'paid', 'failed')`,
    ),
    check(
      "orders_order_status_valid",
      sql`${table.orderStatus} in ('waiting_payment', 'processing', 'shipped', 'delivered', 'cancelled')`,
    ),
  ],
);

export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    productSku: text("product_sku").notNull(),
    productName: text("product_name").notNull(),
    quantity: integer("quantity").notNull(),
    priceAtPurchase: integer("price_at_purchase").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("order_items_order_id_index").on(table.orderId),
    index("order_items_product_id_index").on(table.productId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    check("order_items_price_non_negative", sql`${table.priceAtPurchase} >= 0`),
  ],
);

export type OrderItemRow = typeof orderItems.$inferSelect;
export type NewOrderItemRow = typeof orderItems.$inferInsert;

export const storeBankAccounts = sqliteTable(
  "rekening_toko",
  {
    id: text("id").primaryKey(),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    accountHolderName: text("account_holder_name").notNull(),
    instruction: text("instruction").notNull().default(""),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("rekening_toko_bank_account_unique").on(table.bankName, table.accountNumber),
    index("rekening_toko_active_order_index").on(table.isActive, table.displayOrder),
    check("rekening_toko_display_order_non_negative", sql`${table.displayOrder} >= 0`),
  ],
);

export type StoreBankAccountRow = typeof storeBankAccounts.$inferSelect;
export type NewStoreBankAccountRow = typeof storeBankAccounts.$inferInsert;

export const transferInstructions = sqliteTable(
  "instruksi_transfer",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    instruction: text("instruction").notNull(),
    stepOrder: integer("step_order").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("instruksi_transfer_step_order_unique").on(table.stepOrder),
    index("instruksi_transfer_active_order_index").on(table.isActive, table.stepOrder),
    check("instruksi_transfer_step_order_positive", sql`${table.stepOrder} > 0`),
  ],
);

export type TransferInstructionRow = typeof transferInstructions.$inferSelect;
export type NewTransferInstructionRow = typeof transferInstructions.$inferInsert;
