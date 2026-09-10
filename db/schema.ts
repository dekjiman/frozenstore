import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const products = pgTable(
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
    isActive: boolean("is_active").notNull().default(true),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
    slug: text("slug"),
    shortDescription: text("short_description").notNull().default(""),
    compareAtPrice: integer("compare_at_price"),
    weightValue: integer("weight_value"),
    weightUnit: text("weight_unit").notNull().default("g"),
    piecesMin: integer("pieces_min"),
    piecesMax: integer("pieces_max"),
    isFeatured: boolean("is_featured").notNull().default(false),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),
    isPromo: boolean("is_promo").notNull().default(false),
    ratingAverage: integer("rating_average").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    soldCount: integer("sold_count").notNull().default(0),
    articleId: text("article_id"),
    storageInstructions: text("storage_instructions").notNull().default(""),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    categoryId: text("category_id"),
  },
  (table) => [
    uniqueIndex("products_sku_unique").on(table.sku),
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_active_category_index").on(table.isActive, table.categoryId),
    index("products_active_featured_index").on(table.isActive, table.isFeatured),
    index("products_active_best_seller_index").on(table.isActive, table.isBestSeller),
    check("products_price_non_negative", sql`${table.price} >= 0`),
    check("products_stock_non_negative", sql`${table.currentStock} >= 0`),
  ],
);

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;

export const carts = pgTable(
  "carts",
  {
    id: text("id").primaryKey(),
    sessionKey: text("session_key").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [uniqueIndex("carts_session_key_unique").on(table.sessionKey)],
);

export const cartItems = pgTable(
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
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
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

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    role: text("role", { enum: ["customer", "admin"] }).notNull().default("customer"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    phone: text("phone"),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
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

export const stockMovements = pgTable(
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
    createdAt: timestamp("created_at")
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

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at")
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

export const orders = pgTable(
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
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
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

export const orderItems = pgTable(
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
    createdAt: timestamp("created_at")
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

export const storeBankAccounts = pgTable(
  "rekening_toko",
  {
    id: text("id").primaryKey(),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    accountHolderName: text("account_holder_name").notNull(),
    instruction: text("instruction").notNull().default(""),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
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

export const transferInstructions = pgTable(
  "instruksi_transfer",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    instruction: text("instruction").notNull(),
    stepOrder: integer("step_order").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
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

// ============================================================
// NEW TABLES — Jasmine Shop Premium Product Revamp
// ============================================================

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    imageUrl: text("image_url"),
    iconKey: text("icon_key"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("categories_slug_unique").on(table.slug),
    index("categories_active_sort_index").on(table.isActive, table.sortOrder),
    index("categories_name_index").on(table.name),
  ],
);

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;

export const productMedia = pgTable(
  "product_media",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaType: text("media_type", { enum: ["image", "video"] }).notNull(),
    url: text("url").notNull(),
    storageKey: text("storage_key"),
    thumbnailUrl: text("thumbnail_url"),
    posterUrl: text("poster_url"),
    altText: text("alt_text").notNull().default(""),
    title: text("title").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    durationSeconds: integer("duration_seconds"),
    width: integer("width"),
    height: integer("height"),
    mimeType: text("mime_type"),
    fileSizeBytes: integer("file_size_bytes"),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("product_media_product_sort_index").on(table.productId, table.sortOrder),
    index("product_media_product_id_index").on(table.productId),
    check("product_media_file_size_non_negative", sql`${table.fileSizeBytes} >= 0`),
    check("product_media_width_non_negative", sql`${table.width} >= 0`),
    check("product_media_height_non_negative", sql`${table.height} >= 0`),
    check("product_media_duration_non_negative", sql`${table.durationSeconds} >= 0`),
  ],
);

export type ProductMediaRow = typeof productMedia.$inferSelect;
export type NewProductMediaRow = typeof productMedia.$inferInsert;

export const productBadges = pgTable(
  "product_badges",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    badgeType: text("badge_type").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("product_badges_product_id_index").on(table.productId),
    index("product_badges_sort_index").on(table.sortOrder),
  ],
);

export type ProductBadgeRow = typeof productBadges.$inferSelect;
export type NewProductBadgeRow = typeof productBadges.$inferInsert;

export const heroCampaigns = pgTable(
  "hero_campaigns",
  {
    id: text("id").primaryKey(),
    eyebrow: text("eyebrow").notNull().default(""),
    title: text("title").notNull(),
    highlightedText: text("highlighted_text"),
    description: text("description").notNull().default(""),
    imageUrl: text("image_url").notNull(),
    imageAlt: text("image_alt").notNull().default(""),
    primaryCtaLabel: text("primary_cta_label"),
    primaryCtaUrl: text("primary_cta_url"),
    secondaryCtaLabel: text("secondary_cta_label"),
    secondaryCtaUrl: text("secondary_cta_url"),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("hero_campaigns_active_sort_index").on(table.isActive, table.sortOrder),
    index("hero_campaigns_starts_ends_index").on(table.startsAt, table.endsAt),
  ],
);

export type HeroCampaignRow = typeof heroCampaigns.$inferSelect;
export type NewHeroCampaignRow = typeof heroCampaigns.$inferInsert;

export const promoBanners = pgTable(
  "promo_banners",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull().default(""),
    badgeText: text("badge_text"),
    imageUrl: text("image_url").notNull(),
    backgroundVariant: text("background_variant"),
    ctaLabel: text("cta_label"),
    ctaUrl: text("cta_url"),
    placement: text("placement"),
    sortOrder: integer("sort_order").notNull().default(0),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("promo_banners_active_sort_index").on(table.isActive, table.sortOrder),
    index("promo_banners_placement_index").on(table.placement),
  ],
);

export type PromoBannerRow = typeof promoBanners.$inferSelect;
export type NewPromoBannerRow = typeof promoBanners.$inferInsert;

export const trustItems = pgTable(
  "trust_items",
  {
    id: text("id").primaryKey(),
    iconKey: text("icon_key").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("trust_items_active_sort_index").on(table.isActive, table.sortOrder),
  ],
);

export type TrustItemRow = typeof trustItems.$inferSelect;
export type NewTrustItemRow = typeof trustItems.$inferInsert;

export const articles = pgTable(
  "articles",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    content: text("content").notNull().default(""),
    excerpt: text("excerpt").notNull().default(""),
    coverImage: text("cover_image"),
    authorName: text("author_name").notNull().default("Admin"),
    isPublished: boolean("is_published").notNull().default(true),
    publishedAt: timestamp("published_at")
      .$defaultFn(() => new Date()),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("articles_slug_unique").on(table.slug),
    index("articles_published_index").on(table.isPublished, table.publishedAt),
  ]
);

export type ArticleRow = typeof articles.$inferSelect;
export type NewArticleRow = typeof articles.$inferInsert;

export const testimonials = pgTable(
  "testimonials",
  {
    id: text("id").primaryKey(),
    customerName: text("customer_name").notNull(),
    customerTitle: text("customer_title").notNull().default(""),
    quote: text("quote").notNull(),
    rating: integer("rating").notNull().default(5),
    avatarUrl: text("avatar_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("testimonials_published_sort_index").on(table.isPublished, table.sortOrder),
    check("testimonials_rating_valid", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ],
);

export type TestimonialRow = typeof testimonials.$inferSelect;
export type NewTestimonialRow = typeof testimonials.$inferInsert;

export const siteSettings = pgTable(
  "site_settings",
  {
    id: text("id").primaryKey().$defaultFn(() => "default"),
    brandName: text("brand_name").notNull().default("Jasmine Shop Premium Product"),
    tagline: text("tagline").notNull().default(""),
    logoUrl: text("logo_url"),
    whatsappNumber: text("whatsapp_number"),
    email: text("email"),
    address: text("address"),
    operatingHours: text("operating_hours"),
    freeShippingThreshold: integer("free_shipping_threshold").notNull().default(20000),
    instagramUrl: text("instagram_url"),
    tiktokUrl: text("tiktok_url"),
    youtubeUrl: text("youtube_url"),
    facebookUrl: text("facebook_url"),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    check("site_settings_free_shipping_non_negative", sql`${table.freeShippingThreshold} >= 0`),
  ],
);

export type SiteSettingRow = typeof siteSettings.$inferSelect;
export type NewSiteSettingRow = typeof siteSettings.$inferInsert;

export const marketplaceLinks = pgTable(
  "marketplace_links",
  {
    id: text("id").primaryKey(),
    marketplace: text("marketplace").notNull(),
    label: text("label").notNull(),
    url: text("url").notNull(),
    logoUrl: text("logo_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("marketplace_links_active_sort_index").on(table.isActive, table.sortOrder),
  ],
);

export type MarketplaceLinkRow = typeof marketplaceLinks.$inferSelect;
export type NewMarketplaceLinkRow = typeof marketplaceLinks.$inferInsert;

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    status: text("status", { enum: ["active", "unsubscribed", "bounced"] }).notNull().default("active"),
    source: text("source"),
    subscribedAt: timestamp("subscribed_at")
      .notNull()
      .$defaultFn(() => new Date()),
    unsubscribedAt: timestamp("unsubscribed_at"),
  },
  (table) => [
    uniqueIndex("newsletter_subscribers_email_unique").on(table.email),
    index("newsletter_subscribers_status_index").on(table.status),
  ],
);

export type NewsletterSubscriberRow = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriberRow = typeof newsletterSubscribers.$inferInsert;
