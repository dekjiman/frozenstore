CREATE TABLE "articles" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"cover_image" text,
	"author_name" text DEFAULT 'Admin' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" text PRIMARY KEY NOT NULL,
	"cart_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "cart_items_quantity_positive" CHECK ("cart_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" text PRIMARY KEY NOT NULL,
	"session_key" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text,
	"icon_key" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hero_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"eyebrow" text DEFAULT '' NOT NULL,
	"title" text NOT NULL,
	"highlighted_text" text,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text NOT NULL,
	"image_alt" text DEFAULT '' NOT NULL,
	"primary_cta_label" text,
	"primary_cta_url" text,
	"secondary_cta_label" text,
	"secondary_cta_url" text,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_links" (
	"id" text PRIMARY KEY NOT NULL,
	"marketplace" text NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"logo_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"source" text,
	"subscribed_at" timestamp NOT NULL,
	"unsubscribed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"product_sku" text NOT NULL,
	"product_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"price_at_purchase" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_price_non_negative" CHECK ("order_items"."price_at_purchase" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"user_id" text,
	"customer_id" text NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient_phone" text NOT NULL,
	"shipping_address" text NOT NULL,
	"shipping_city" text NOT NULL,
	"shipping_province" text NOT NULL,
	"shipping_postal_code" text NOT NULL,
	"shipping_notes" text,
	"subtotal_amount" integer NOT NULL,
	"shipping_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"payment_proof_url" text,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"order_status" text DEFAULT 'waiting_payment' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "orders_subtotal_non_negative" CHECK ("orders"."subtotal_amount" >= 0),
	CONSTRAINT "orders_shipping_non_negative" CHECK ("orders"."shipping_amount" >= 0),
	CONSTRAINT "orders_total_non_negative" CHECK ("orders"."total_amount" >= 0),
	CONSTRAINT "orders_payment_status_valid" CHECK ("orders"."payment_status" in ('pending', 'awaiting_verification', 'paid', 'failed')),
	CONSTRAINT "orders_order_status_valid" CHECK ("orders"."order_status" in ('waiting_payment', 'processing', 'shipped', 'delivered', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "product_badges" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"label" text NOT NULL,
	"badge_type" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"media_type" text NOT NULL,
	"url" text NOT NULL,
	"storage_key" text,
	"thumbnail_url" text,
	"poster_url" text,
	"alt_text" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"duration_seconds" integer,
	"width" integer,
	"height" integer,
	"mime_type" text,
	"file_size_bytes" integer,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "product_media_file_size_non_negative" CHECK ("product_media"."file_size_bytes" >= 0),
	CONSTRAINT "product_media_width_non_negative" CHECK ("product_media"."width" >= 0),
	CONSTRAINT "product_media_height_non_negative" CHECK ("product_media"."height" >= 0),
	CONSTRAINT "product_media_duration_non_negative" CHECK ("product_media"."duration_seconds" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"current_stock" integer DEFAULT 0 NOT NULL,
	"image_url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"slug" text,
	"short_description" text DEFAULT '' NOT NULL,
	"compare_at_price" integer,
	"weight_value" integer,
	"weight_unit" text DEFAULT 'g' NOT NULL,
	"pieces_min" integer,
	"pieces_max" integer,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_best_seller" boolean DEFAULT false NOT NULL,
	"is_new" boolean DEFAULT false NOT NULL,
	"is_promo" boolean DEFAULT false NOT NULL,
	"rating_average" integer DEFAULT 0 NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"sold_count" integer DEFAULT 0 NOT NULL,
	"article_id" text,
	"storage_instructions" text DEFAULT '' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"category_id" text,
	CONSTRAINT "products_price_non_negative" CHECK ("products"."price" >= 0),
	CONSTRAINT "products_stock_non_negative" CHECK ("products"."current_stock" >= 0)
);
--> statement-breakpoint
CREATE TABLE "promo_banners" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"badge_text" text,
	"image_url" text NOT NULL,
	"background_variant" text,
	"cta_label" text,
	"cta_url" text,
	"placement" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_name" text DEFAULT 'Jasmine Shop Premium Product' NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"logo_url" text,
	"whatsapp_number" text,
	"email" text,
	"address" text,
	"operating_hours" text,
	"free_shipping_threshold" integer DEFAULT 20000 NOT NULL,
	"instagram_url" text,
	"tiktok_url" text,
	"youtube_url" text,
	"facebook_url" text,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "site_settings_free_shipping_non_negative" CHECK ("site_settings"."free_shipping_threshold" >= 0)
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"type" text NOT NULL,
	"quantity" integer NOT NULL,
	"stock_before" integer NOT NULL,
	"stock_after" integer NOT NULL,
	"reason" text NOT NULL,
	"reference" text,
	"created_by" text,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "stock_movements_type_valid" CHECK ("stock_movements"."type" in ('in', 'out', 'adjustment')),
	CONSTRAINT "stock_movements_quantity_positive" CHECK ("stock_movements"."quantity" > 0),
	CONSTRAINT "stock_movements_before_non_negative" CHECK ("stock_movements"."stock_before" >= 0),
	CONSTRAINT "stock_movements_after_non_negative" CHECK ("stock_movements"."stock_after" >= 0),
	CONSTRAINT "stock_movements_reason_not_empty" CHECK (length(trim("stock_movements"."reason")) > 0)
);
--> statement-breakpoint
CREATE TABLE "rekening_toko" (
	"id" text PRIMARY KEY NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_holder_name" text NOT NULL,
	"instruction" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "rekening_toko_display_order_non_negative" CHECK ("rekening_toko"."display_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"customer_title" text DEFAULT '' NOT NULL,
	"quote" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"avatar_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "testimonials_rating_valid" CHECK ("testimonials"."rating" >= 1 AND "testimonials"."rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "instruksi_transfer" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"instruction" text NOT NULL,
	"step_order" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "instruksi_transfer_step_order_positive" CHECK ("instruksi_transfer"."step_order" > 0)
);
--> statement-breakpoint
CREATE TABLE "trust_items" (
	"id" text PRIMARY KEY NOT NULL,
	"icon_key" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text DEFAULT 'customer' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"phone" text,
	"password_hash" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_role_valid" CHECK ("users"."role" in ('customer', 'admin'))
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_badges" ADD CONSTRAINT "product_badges_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "articles_slug_unique" ON "articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "articles_published_index" ON "articles" USING btree ("is_published","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_token_hash_unique" ON "auth_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_index" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_at_index" ON "auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_cart_product_unique" ON "cart_items" USING btree ("cart_id","product_id");--> statement-breakpoint
CREATE INDEX "cart_items_cart_id_index" ON "cart_items" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_items_product_id_index" ON "cart_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "carts_session_key_unique" ON "carts" USING btree ("session_key");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_active_sort_index" ON "categories" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "categories_name_index" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "hero_campaigns_active_sort_index" ON "hero_campaigns" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "hero_campaigns_starts_ends_index" ON "hero_campaigns" USING btree ("starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "marketplace_links_active_sort_index" ON "marketplace_links" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscribers_email_unique" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "newsletter_subscribers_status_index" ON "newsletter_subscribers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_items_order_id_index" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_id_index" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_number_unique" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_user_id_index" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_customer_id_index" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_payment_status_index" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "orders_order_status_index" ON "orders" USING btree ("order_status");--> statement-breakpoint
CREATE INDEX "product_badges_product_id_index" ON "product_badges" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_badges_sort_index" ON "product_badges" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "product_media_product_sort_index" ON "product_media" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE INDEX "product_media_product_id_index" ON "product_media" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_unique" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_unique" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_active_category_index" ON "products" USING btree ("is_active","category_id");--> statement-breakpoint
CREATE INDEX "products_active_featured_index" ON "products" USING btree ("is_active","is_featured");--> statement-breakpoint
CREATE INDEX "products_active_best_seller_index" ON "products" USING btree ("is_active","is_best_seller");--> statement-breakpoint
CREATE INDEX "promo_banners_active_sort_index" ON "promo_banners" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "promo_banners_placement_index" ON "promo_banners" USING btree ("placement");--> statement-breakpoint
CREATE INDEX "stock_movements_product_created_index" ON "stock_movements" USING btree ("product_id","created_at");--> statement-breakpoint
CREATE INDEX "stock_movements_type_created_index" ON "stock_movements" USING btree ("type","created_at");--> statement-breakpoint
CREATE INDEX "stock_movements_reference_index" ON "stock_movements" USING btree ("reference");--> statement-breakpoint
CREATE UNIQUE INDEX "rekening_toko_bank_account_unique" ON "rekening_toko" USING btree ("bank_name","account_number");--> statement-breakpoint
CREATE INDEX "rekening_toko_active_order_index" ON "rekening_toko" USING btree ("is_active","display_order");--> statement-breakpoint
CREATE INDEX "testimonials_published_sort_index" ON "testimonials" USING btree ("is_published","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "instruksi_transfer_step_order_unique" ON "instruksi_transfer" USING btree ("step_order");--> statement-breakpoint
CREATE INDEX "instruksi_transfer_active_order_index" ON "instruksi_transfer" USING btree ("is_active","step_order");--> statement-breakpoint
CREATE INDEX "trust_items_active_sort_index" ON "trust_items" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_unique" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_role_index" ON "users" USING btree ("role");