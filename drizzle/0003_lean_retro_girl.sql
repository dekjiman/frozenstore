CREATE TABLE `rekening_toko` (
	`id` text PRIMARY KEY NOT NULL,
	`bank_name` text NOT NULL,
	`account_number` text NOT NULL,
	`account_holder_name` text NOT NULL,
	`instruction` text DEFAULT '' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "rekening_toko_display_order_non_negative" CHECK("rekening_toko"."display_order" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rekening_toko_bank_account_unique` ON `rekening_toko` (`bank_name`,`account_number`);--> statement-breakpoint
CREATE INDEX `rekening_toko_active_order_index` ON `rekening_toko` (`is_active`,`display_order`);