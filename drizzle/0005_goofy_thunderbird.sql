PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`customer_id` text NOT NULL,
	`recipient_name` text NOT NULL,
	`recipient_phone` text NOT NULL,
	`shipping_address` text NOT NULL,
	`shipping_city` text NOT NULL,
	`shipping_province` text NOT NULL,
	`shipping_postal_code` text NOT NULL,
	`shipping_notes` text,
	`subtotal_amount` integer NOT NULL,
	`shipping_amount` integer DEFAULT 0 NOT NULL,
	`total_amount` integer NOT NULL,
	`payment_proof_url` text,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`order_status` text DEFAULT 'waiting_payment' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "orders_subtotal_non_negative" CHECK("__new_orders"."subtotal_amount" >= 0),
	CONSTRAINT "orders_shipping_non_negative" CHECK("__new_orders"."shipping_amount" >= 0),
	CONSTRAINT "orders_total_non_negative" CHECK("__new_orders"."total_amount" >= 0),
	CONSTRAINT "orders_payment_status_valid" CHECK("__new_orders"."payment_status" in ('pending', 'awaiting_verification', 'paid', 'failed')),
	CONSTRAINT "orders_order_status_valid" CHECK("__new_orders"."order_status" in ('waiting_payment', 'processing', 'shipped', 'delivered', 'cancelled'))
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "order_number", "customer_id", "recipient_name", "recipient_phone", "shipping_address", "shipping_city", "shipping_province", "shipping_postal_code", "shipping_notes", "subtotal_amount", "shipping_amount", "total_amount", "payment_proof_url", "payment_status", "order_status", "created_at", "updated_at") SELECT "id", "order_number", "customer_id", "recipient_name", "recipient_phone", "shipping_address", "shipping_city", "shipping_province", "shipping_postal_code", "shipping_notes", "subtotal_amount", "shipping_amount", "total_amount", "payment_proof_url", "payment_status", "order_status", "created_at", "updated_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE INDEX `orders_customer_id_index` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `orders_payment_status_index` ON `orders` (`payment_status`);--> statement-breakpoint
CREATE INDEX `orders_order_status_index` ON `orders` (`order_status`);