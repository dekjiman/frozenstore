CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`type` text NOT NULL,
	`quantity` integer NOT NULL,
	`stock_before` integer NOT NULL,
	`stock_after` integer NOT NULL,
	`reason` text NOT NULL,
	`reference` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "stock_movements_type_valid" CHECK("stock_movements"."type" in ('in', 'out', 'adjustment')),
	CONSTRAINT "stock_movements_quantity_positive" CHECK("stock_movements"."quantity" > 0),
	CONSTRAINT "stock_movements_before_non_negative" CHECK("stock_movements"."stock_before" >= 0),
	CONSTRAINT "stock_movements_after_non_negative" CHECK("stock_movements"."stock_after" >= 0),
	CONSTRAINT "stock_movements_reason_not_empty" CHECK(length(trim("stock_movements"."reason")) > 0)
);
--> statement-breakpoint
CREATE INDEX `stock_movements_product_created_index` ON `stock_movements` (`product_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `stock_movements_type_created_index` ON `stock_movements` (`type`,`created_at`);--> statement-breakpoint
CREATE INDEX `stock_movements_reference_index` ON `stock_movements` (`reference`);