CREATE TABLE `board_creations` (
	`owner_id` text NOT NULL,
	`operation_id` text NOT NULL,
	`digest` text NOT NULL,
	`board_id` text NOT NULL,
	PRIMARY KEY(`owner_id`, `operation_id`),
	FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `board_creations_board_idx` ON `board_creations` (`board_id`);