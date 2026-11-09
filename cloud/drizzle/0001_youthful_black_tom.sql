CREATE TABLE `api_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `api_limits_expiry_idx` ON `api_limits` (`expires_at`);