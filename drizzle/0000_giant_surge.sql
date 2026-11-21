CREATE TABLE `accounts` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`provider` varchar(40) NOT NULL,
	`provider_account_id` varchar(255) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`expires_at` int,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `accounts_provider_uq` UNIQUE(`provider`,`provider_account_id`)
);
--> statement-breakpoint
CREATE TABLE `admin_activity_logs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`admin_user_id` bigint unsigned NOT NULL,
	`action` varchar(120) NOT NULL,
	`entity_type` varchar(80) NOT NULL,
	`entity_id` bigint unsigned,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `admin_activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `application_submissions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned,
	`application_type` enum('FREELANCER','PARTNER') NOT NULL,
	`payload` json NOT NULL,
	`status` enum('DRAFT','PENDING','PUBLISHED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'PENDING',
	`reviewed_by` bigint unsigned,
	`reviewed_at` datetime,
	`rejection_reason` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `application_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`content_id` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookmarks_user_content_uq` UNIQUE(`user_id`,`content_id`)
);
--> statement-breakpoint
CREATE TABLE `business_profiles` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`business_name` varchar(180) NOT NULL,
	`category` varchar(120),
	`city` varchar(120),
	`established_year` int,
	`outlet_count` int,
	`scale` varchar(80),
	`main_challenge` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `business_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_profiles_user_uq` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `education_categories` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `education_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `education_categories_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `education_contents` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`category_id` bigint unsigned,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text,
	`body` text,
	`format` varchar(50),
	`level` varchar(30),
	`access` enum('FREE','MEMBER','PREMIUM') DEFAULT 'FREE',
	`status` enum('DRAFT','PENDING','PUBLISHED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
	`published_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `education_contents_id` PRIMARY KEY(`id`),
	CONSTRAINT `education_contents_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `freelancer_portfolios` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`freelancer_profile_id` bigint unsigned NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`image_url` varchar(500),
	`project_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `freelancer_portfolios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `freelancer_profiles` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`slug` varchar(200) NOT NULL,
	`bio` text,
	`city` varchar(120),
	`work_mode` enum('REMOTE','ONSITE','HYBRID'),
	`price_from` int,
	`availability` varchar(80),
	`verified` boolean DEFAULT false,
	`status` enum('DRAFT','PENDING','PUBLISHED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'PENDING',
	`approved_by` bigint unsigned,
	`approved_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `freelancer_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `freelancer_profiles_user_uq` UNIQUE(`user_id`),
	CONSTRAINT `freelancer_profiles_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `freelancer_requests` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`requester_user_id` bigint unsigned,
	`freelancer_profile_id` bigint unsigned NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(255) NOT NULL,
	`whatsapp` varchar(32) NOT NULL,
	`message` text NOT NULL,
	`request_status` enum('NEW','CONTACTED','CLOSED') DEFAULT 'NEW',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `freelancer_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `freelancer_skills` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`freelancer_profile_id` bigint unsigned NOT NULL,
	`name` varchar(120) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `freelancer_skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`owner_user_id` bigint unsigned,
	`name` varchar(180) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`status` enum('DRAFT','PENDING','PUBLISHED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'PENDING',
	`approved_by` bigint unsigned,
	`approved_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`),
	CONSTRAINT `partners_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_categories` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `product_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_categories_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_member_prices` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`price` int NOT NULL,
	`starts_at` datetime,
	`ends_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `product_member_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`partner_id` bigint unsigned NOT NULL,
	`category_id` bigint unsigned,
	`name` varchar(220) NOT NULL,
	`slug` varchar(240) NOT NULL,
	`description` text,
	`regular_price` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'IDR',
	`offer_url` varchar(500),
	`featured` boolean DEFAULT false,
	`status` enum('DRAFT','PENDING','PUBLISHED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `service_inquiries` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned,
	`service_package_id` bigint unsigned,
	`name` varchar(160) NOT NULL,
	`email` varchar(255) NOT NULL,
	`whatsapp` varchar(32) NOT NULL,
	`message` text NOT NULL,
	`inquiry_status` enum('NEW','CONTACTED','QUALIFIED','CLOSED') DEFAULT 'NEW',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `service_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_packages` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`billing_period` varchar(30),
	`duration_label` varchar(80),
	`deliverables` json,
	`status` enum('DRAFT','PENDING','PUBLISHED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `service_packages_id` PRIMARY KEY(`id`),
	CONSTRAINT `service_packages_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`ip_hash` varchar(128),
	`user_agent` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_uq` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(255) NOT NULL,
	`whatsapp` varchar(32),
	`password_hash` varchar(255),
	`role` enum('MEMBER','FREELANCER','PARTNER','ADMIN') NOT NULL DEFAULT 'MEMBER',
	`email_verified_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`),
	CONSTRAINT `wishlists_user_product_uq` UNIQUE(`user_id`,`product_id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_activity_logs` ADD CONSTRAINT `admin_activity_logs_admin_user_id_users_id_fk` FOREIGN KEY (`admin_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_submissions` ADD CONSTRAINT `application_submissions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_submissions` ADD CONSTRAINT `application_submissions_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_content_id_education_contents_id_fk` FOREIGN KEY (`content_id`) REFERENCES `education_contents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_profiles` ADD CONSTRAINT `business_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `education_contents` ADD CONSTRAINT `education_contents_category_id_education_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `education_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `freelancer_portfolios` ADD CONSTRAINT `freelancer_portfolios_profile_fk` FOREIGN KEY (`freelancer_profile_id`) REFERENCES `freelancer_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `freelancer_profiles` ADD CONSTRAINT `freelancer_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `freelancer_profiles` ADD CONSTRAINT `freelancer_profiles_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `freelancer_requests` ADD CONSTRAINT `freelancer_requests_requester_user_id_users_id_fk` FOREIGN KEY (`requester_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `freelancer_requests` ADD CONSTRAINT `freelancer_requests_profile_fk` FOREIGN KEY (`freelancer_profile_id`) REFERENCES `freelancer_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `freelancer_skills` ADD CONSTRAINT `freelancer_skills_profile_fk` FOREIGN KEY (`freelancer_profile_id`) REFERENCES `freelancer_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partners` ADD CONSTRAINT `partners_owner_user_id_users_id_fk` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partners` ADD CONSTRAINT `partners_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_member_prices` ADD CONSTRAINT `product_member_prices_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_partner_id_partners_id_fk` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_product_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_inquiries` ADD CONSTRAINT `service_inquiries_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_inquiries` ADD CONSTRAINT `service_inquiries_service_package_id_service_packages_id_fk` FOREIGN KEY (`service_package_id`) REFERENCES `service_packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlists` ADD CONSTRAINT `wishlists_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlists` ADD CONSTRAINT `wishlists_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `admin_logs_actor_idx` ON `admin_activity_logs` (`admin_user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `admin_logs_entity_idx` ON `admin_activity_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `applications_review_idx` ON `application_submissions` (`application_type`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `business_profiles_category_idx` ON `business_profiles` (`category`);--> statement-breakpoint
CREATE INDEX `education_contents_search_idx` ON `education_contents` (`status`,`category_id`,`published_at`);--> statement-breakpoint
CREATE INDEX `freelancer_portfolios_profile_idx` ON `freelancer_portfolios` (`freelancer_profile_id`);--> statement-breakpoint
CREATE INDEX `freelancer_profiles_directory_idx` ON `freelancer_profiles` (`status`,`city`,`work_mode`);--> statement-breakpoint
CREATE INDEX `freelancer_requests_status_idx` ON `freelancer_requests` (`request_status`,`created_at`);--> statement-breakpoint
CREATE INDEX `freelancer_skills_name_idx` ON `freelancer_skills` (`name`);--> statement-breakpoint
CREATE INDEX `partners_status_idx` ON `partners` (`status`);--> statement-breakpoint
CREATE INDEX `member_prices_product_idx` ON `product_member_prices` (`product_id`,`starts_at`,`ends_at`);--> statement-breakpoint
CREATE INDEX `products_catalog_idx` ON `products` (`status`,`category_id`,`partner_id`);--> statement-breakpoint
CREATE INDEX `service_inquiries_status_idx` ON `service_inquiries` (`inquiry_status`,`created_at`);--> statement-breakpoint
CREATE INDEX `service_inquiries_user_idx` ON `service_inquiries` (`user_id`);--> statement-breakpoint
CREATE INDEX `service_packages_status_idx` ON `service_packages` (`status`);--> statement-breakpoint
CREATE INDEX `sessions_user_expiry_idx` ON `sessions` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);
