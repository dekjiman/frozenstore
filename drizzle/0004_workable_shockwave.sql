CREATE TABLE `instruksi_transfer` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`instruction` text NOT NULL,
	`step_order` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "instruksi_transfer_step_order_positive" CHECK("instruksi_transfer"."step_order" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instruksi_transfer_step_order_unique` ON `instruksi_transfer` (`step_order`);--> statement-breakpoint
CREATE INDEX `instruksi_transfer_active_order_index` ON `instruksi_transfer` (`is_active`,`step_order`);