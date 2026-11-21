ALTER TABLE `freelancer_requests` MODIFY COLUMN `request_status` enum('NEW','CONTACTED','ACCEPTED','IN_PROGRESS','SUBMITTED','COMPLETED','DECLINED','CLOSED') DEFAULT 'NEW';--> statement-breakpoint
ALTER TABLE `freelancer_requests` ADD `project_title` varchar(180);--> statement-breakpoint
ALTER TABLE `freelancer_requests` ADD `budget` int;--> statement-breakpoint
ALTER TABLE `freelancer_requests` ADD `target_date` varchar(10);--> statement-breakpoint
ALTER TABLE `freelancer_requests` ADD `deliverable_url` varchar(1000);--> statement-breakpoint
ALTER TABLE `freelancer_requests` ADD `completion_note` text;--> statement-breakpoint
CREATE INDEX `freelancer_requests_member_idx` ON `freelancer_requests` (`requester_user_id`,`created_at`);