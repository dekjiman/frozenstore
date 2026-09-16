ALTER TABLE "shipping_settings" DROP CONSTRAINT "shipping_settings_default_weight_positive";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP CONSTRAINT "shipping_settings_instant_vehicle_valid";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "is_kirimaja_active";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "api_key";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "origin_province_id";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "origin_city_id";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "origin_district_id";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "origin_subdistrict_id";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "origin_province_name";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "origin_city_name";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "origin_district_name";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "origin_subdistrict_name";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "origin_address";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "origin_latitude";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "origin_longitude";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "enable_paxel";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "enable_grab_express";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "enable_gosend";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "instant_vehicle";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "timezone";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "default_item_weight_g";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "packing_weight_g";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "box_length_cm";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "box_width_cm";--> statement-breakpoint
ALTER TABLE "shipping_settings" DROP COLUMN "box_height_cm";--> statement-breakpoint
ALTER TABLE "shipping_settings" ADD COLUMN "enable_same_day" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_settings" ADD COLUMN "enable_instant" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_order_status_valid";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_method" text DEFAULT 'regular' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_method_valid" CHECK ("orders"."shipping_method" in ('regular', 'same_day', 'instant'));--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_status_valid" CHECK ("orders"."order_status" in ('waiting_payment', 'waiting_shipping_fee', 'processing', 'shipped', 'delivered', 'cancelled'));