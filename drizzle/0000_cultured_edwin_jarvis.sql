CREATE TABLE `observations` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`original_key` text NOT NULL,
	`preview_key` text,
	`published` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`object_key` text NOT NULL,
	`upload_id` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL
);
