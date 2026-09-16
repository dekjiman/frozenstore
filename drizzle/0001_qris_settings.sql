CREATE TABLE "qris_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text DEFAULT 'QRIS' NOT NULL,
	"merchant_name" text NOT NULL,
	"pay_id" text NOT NULL,
	"qr_image_url" text DEFAULT '' NOT NULL,
	"instruction" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "qris_settings_active_index" ON "qris_settings" USING btree ("is_active");