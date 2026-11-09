CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`parent_id` text,
	`item_id` text,
	`author_id` text NOT NULL,
	`author_name` text NOT NULL,
	`body` text NOT NULL,
	`x` real NOT NULL,
	`y` real NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`resolved` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comments_board_idx` ON `comments` (`board_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `boards` ADD `activity_revision` integer DEFAULT 0 NOT NULL;