CREATE TABLE `digital_readiness_assessments` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`business_name` varchar(180) NOT NULL,
	`business_category` varchar(120) NOT NULL,
	`answers` json NOT NULL,
	`dimension_scores` json NOT NULL,
	`total_score` int NOT NULL,
	`level` varchar(50) NOT NULL,
	`recommendations` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `digital_readiness_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `digital_readiness_assessments` ADD CONSTRAINT `digital_readiness_assessments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `digital_readiness_user_idx` ON `digital_readiness_assessments` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `digital_readiness_score_idx` ON `digital_readiness_assessments` (`total_score`,`created_at`);