CREATE TABLE "magic_links" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"order_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "magic_links_expires_at_index" ON "magic_links" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "magic_links_order_id_index" ON "magic_links" USING btree ("order_id");