ALTER TABLE `products` ADD `seller_id` integer REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `products` ADD `status` text DEFAULT 'approved' NOT NULL;