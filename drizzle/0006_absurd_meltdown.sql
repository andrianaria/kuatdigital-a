CREATE TABLE `freelancer_service_packages` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`freelancer_profile_id` bigint unsigned NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`price` int NOT NULL,
	`freelancer_package_price_type` enum('FIXED','STARTING_FROM','HOURLY','MONTHLY','CONTACT') NOT NULL DEFAULT 'FIXED',
	`duration_label` varchar(100),
	`deliverables` json,
	`status` enum('DRAFT','PENDING','PUBLISHED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `freelancer_service_packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `pricing_model` varchar(80);--> statement-breakpoint
ALTER TABLE `products` ADD `price_label` varchar(120);--> statement-breakpoint
ALTER TABLE `products` ADD `platforms` json;--> statement-breakpoint
ALTER TABLE `products` ADD `best_for` text;--> statement-breakpoint
ALTER TABLE `products` ADD `features` json;--> statement-breakpoint
ALTER TABLE `products` ADD `setup_level` varchar(80);--> statement-breakpoint
ALTER TABLE `products` ADD `logo_url` varchar(1000);--> statement-breakpoint
ALTER TABLE `freelancer_service_packages` ADD CONSTRAINT `freelancer_service_packages_profile_fk` FOREIGN KEY (`freelancer_profile_id`) REFERENCES `freelancer_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `freelancer_service_packages_profile_idx` ON `freelancer_service_packages` (`freelancer_profile_id`,`status`);