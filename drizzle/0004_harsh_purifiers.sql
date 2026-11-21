CREATE TABLE `consultation_bookings` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`slot_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`topic` varchar(180) NOT NULL,
	`notes` text NOT NULL,
	`booking_status` enum('PENDING','CONFIRMED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`meeting_url` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `consultation_bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `consultation_bookings_slot_uq` UNIQUE(`slot_id`)
);
--> statement-breakpoint
CREATE TABLE `consultation_slots` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`starts_at` datetime NOT NULL,
	`duration_minutes` int NOT NULL DEFAULT 30,
	`consultant_name` varchar(160) NOT NULL,
	`meeting_mode` enum('GOOGLE_MEET','ZOOM','WHATSAPP_CALL') NOT NULL DEFAULT 'GOOGLE_MEET',
	`slot_status` enum('AVAILABLE','BOOKED','BLOCKED') NOT NULL DEFAULT 'AVAILABLE',
	`created_by` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `consultation_slots_id` PRIMARY KEY(`id`),
	CONSTRAINT `consultation_slots_start_uq` UNIQUE(`starts_at`)
);
--> statement-breakpoint
ALTER TABLE `consultation_bookings` ADD CONSTRAINT `consultation_bookings_slot_id_consultation_slots_id_fk` FOREIGN KEY (`slot_id`) REFERENCES `consultation_slots`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `consultation_bookings` ADD CONSTRAINT `consultation_bookings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `consultation_slots` ADD CONSTRAINT `consultation_slots_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `consultation_bookings_user_idx` ON `consultation_bookings` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `consultation_bookings_status_idx` ON `consultation_bookings` (`booking_status`,`created_at`);--> statement-breakpoint
CREATE INDEX `consultation_slots_status_idx` ON `consultation_slots` (`slot_status`,`starts_at`);