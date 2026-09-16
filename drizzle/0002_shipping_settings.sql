CREATE TABLE "shipping_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"is_kirimaja_active" boolean DEFAULT false NOT NULL,
	"api_key" text DEFAULT '' NOT NULL,
	"origin_province_id" text,
	"origin_city_id" text,
	"origin_district_id" text,
	"origin_subdistrict_id" text,
	"origin_province_name" text,
	"origin_city_name" text,
	"origin_district_name" text,
	"origin_subdistrict_name" text,
	"origin_address" text DEFAULT '' NOT NULL,
	"origin_latitude" double precision,
	"origin_longitude" double precision,
	"enable_paxel" boolean DEFAULT true NOT NULL,
	"enable_grab_express" boolean DEFAULT true NOT NULL,
	"enable_gosend" boolean DEFAULT false NOT NULL,
	"instant_vehicle" text DEFAULT 'motor' NOT NULL,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"default_item_weight_g" integer DEFAULT 500 NOT NULL,
	"packing_weight_g" integer DEFAULT 0 NOT NULL,
	"box_length_cm" integer DEFAULT 20 NOT NULL,
	"box_width_cm" integer DEFAULT 15 NOT NULL,
	"box_height_cm" integer DEFAULT 10 NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "shipping_settings_default_weight_positive" CHECK ("shipping_settings"."default_item_weight_g" > 0),
	CONSTRAINT "shipping_settings_instant_vehicle_valid" CHECK ("shipping_settings"."instant_vehicle" in ('motor', 'mobil'))
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "courier_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "courier_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "courier_service_type" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_etd" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_origin_subdistrict_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_origin_subdistrict_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_destination_subdistrict_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_destination_subdistrict_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_destination_latitude" double precision;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_destination_longitude" double precision;