ALTER TABLE `products` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `products_active_name_index` ON `products` (`is_active`,`name`);