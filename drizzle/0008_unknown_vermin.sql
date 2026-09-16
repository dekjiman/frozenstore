CREATE TABLE "reseller_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"plan_label" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"min_order" integer DEFAULT 10 NOT NULL,
	"discount_min_percent" integer DEFAULT 0 NOT NULL,
	"discount_max_percent" integer DEFAULT 0 NOT NULL,
	"margin_min" integer DEFAULT 0 NOT NULL,
	"margin_max" integer DEFAULT 0 NOT NULL,
	"free_variant_mix" boolean DEFAULT true NOT NULL,
	"is_recommended" boolean DEFAULT false NOT NULL,
	"simulate_daily_pcs" integer,
	"simulate_profit_per_pcs" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "reseller_packages_min_order_non_negative" CHECK ("reseller_packages"."min_order" >= 0),
	CONSTRAINT "reseller_packages_discount_min_valid" CHECK ("reseller_packages"."discount_min_percent" >= 0 AND "reseller_packages"."discount_min_percent" <= 100),
	CONSTRAINT "reseller_packages_discount_max_valid" CHECK ("reseller_packages"."discount_max_percent" >= 0 AND "reseller_packages"."discount_max_percent" <= 100),
	CONSTRAINT "reseller_packages_discount_range_valid" CHECK ("reseller_packages"."discount_max_percent" >= "reseller_packages"."discount_min_percent"),
	CONSTRAINT "reseller_packages_margin_non_negative" CHECK ("reseller_packages"."margin_min" >= 0 AND "reseller_packages"."margin_max" >= 0),
	CONSTRAINT "reseller_packages_margin_range_valid" CHECK ("reseller_packages"."margin_max" >= "reseller_packages"."margin_min"),
	CONSTRAINT "reseller_packages_sort_non_negative" CHECK ("reseller_packages"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "reseller_packages_slug_unique" ON "reseller_packages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "reseller_packages_active_sort_index" ON "reseller_packages" USING btree ("is_active","sort_order");