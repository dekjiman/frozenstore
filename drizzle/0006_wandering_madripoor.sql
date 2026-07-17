CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_sku` text NOT NULL,
	`product_name` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_at_purchase` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "order_items_quantity_positive" CHECK("order_items"."quantity" > 0),
	CONSTRAINT "order_items_price_non_negative" CHECK("order_items"."price_at_purchase" >= 0)
);
--> statement-breakpoint
CREATE INDEX `order_items_order_id_index` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_product_id_index` ON `order_items` (`product_id`);