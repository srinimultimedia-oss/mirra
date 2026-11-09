CREATE TABLE `boards` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`document` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	`last_operation` text
);
--> statement-breakpoint
CREATE INDEX `boards_owner_idx` ON `boards` (`owner_id`);--> statement-breakpoint
CREATE TABLE `members` (
	`board_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`board_id`, `email`),
	FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `members_email_idx` ON `members` (`email`);--> statement-breakpoint
CREATE TABLE `mutations` (
	`board_id` text NOT NULL,
	`operation_id` text NOT NULL,
	`digest` text NOT NULL,
	PRIMARY KEY(`board_id`, `operation_id`),
	FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `presence` (
	`board_id` text NOT NULL,
	`client_id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`x` real,
	`y` real,
	`seen_at` integer NOT NULL,
	PRIMARY KEY(`board_id`, `client_id`),
	FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `presence_expiry_idx` ON `presence` (`board_id`,`seen_at`);