CREATE TABLE `voting_mutations` (
	`session_id` text NOT NULL,
	`operation_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`digest` text NOT NULL,
	PRIMARY KEY(`session_id`, `operation_id`),
	FOREIGN KEY (`session_id`) REFERENCES `voting_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `voting_participants` (
	`session_id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`votes` text DEFAULT '{}' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`done` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`session_id`, `user_id`),
	FOREIGN KEY (`session_id`) REFERENCES `voting_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "voting_votes_json_check" CHECK(json_valid("voting_participants"."votes") AND json_type("voting_participants"."votes") = 'object'),
	CONSTRAINT "voting_done_check" CHECK("voting_participants"."done" IN (0,1)),
	CONSTRAINT "voting_participant_revision_check" CHECK("voting_participants"."revision" >= 0)
);
--> statement-breakpoint
CREATE TABLE `voting_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`facilitator_id` text NOT NULL,
	`title` text NOT NULL,
	`item_ids` text NOT NULL,
	`votes_per_person` integer NOT NULL,
	`single_per_item` integer NOT NULL,
	`duration_ms` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`ends_at` integer,
	`created_at` integer NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`request_digest` text NOT NULL,
	FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "voting_budget_check" CHECK("voting_sessions"."votes_per_person" BETWEEN 1 AND 99),
	CONSTRAINT "voting_single_check" CHECK("voting_sessions"."single_per_item" IN (0,1)),
	CONSTRAINT "voting_duration_check" CHECK("voting_sessions"."duration_ms" BETWEEN 1000 AND 604800000),
	CONSTRAINT "voting_status_check" CHECK("voting_sessions"."status" IN ('draft','active','ended')),
	CONSTRAINT "voting_end_check" CHECK(("voting_sessions"."status" = 'draft' AND "voting_sessions"."ends_at" IS NULL) OR ("voting_sessions"."status" IN ('active','ended') AND "voting_sessions"."ends_at" IS NOT NULL)),
	CONSTRAINT "voting_items_check" CHECK(json_valid("voting_sessions"."item_ids") AND json_type("voting_sessions"."item_ids") = 'array'),
	CONSTRAINT "voting_revision_check" CHECK("voting_sessions"."revision" >= 0)
);
--> statement-breakpoint
CREATE INDEX `voting_sessions_board_idx` ON `voting_sessions` (`board_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `voting_one_active_board_idx` ON `voting_sessions` (`board_id`) WHERE "voting_sessions"."status" = 'active';