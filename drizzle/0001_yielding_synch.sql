CREATE TABLE `accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`login` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`email` varchar(320),
	`emailPassword` varchar(255),
	`notes` text,
	`status` enum('available','sold','reserved') NOT NULL DEFAULT 'available',
	`soldAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` json,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`backgroundColor` varchar(7) DEFAULT '#FF6B6B',
	`textColor` varchar(7) DEFAULT '#FFFFFF',
	`isActive` boolean NOT NULL DEFAULT true,
	`displayOrder` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `carts_id` PRIMARY KEY(`id`),
	CONSTRAINT `carts_userId_productId_idx` UNIQUE(`userId`,`productId`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` varchar(500),
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountType` enum('percentage','fixed') NOT NULL,
	`discountValue` decimal(10,2) NOT NULL,
	`maxUses` int,
	`currentUses` int NOT NULL DEFAULT 0,
	`isOneTimeUse` boolean NOT NULL DEFAULT false,
	`applicableCategories` json,
	`applicableProducts` json,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `favorites_userId_productId_idx` UNIQUE(`userId`,`productId`)
);
--> statement-breakpoint
CREATE TABLE `ip_blocklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`reason` text,
	`blockedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `ip_blocklist_id` PRIMARY KEY(`id`),
	CONSTRAINT `ip_blocklist_ipAddress_unique` UNIQUE(`ipAddress`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`accountId` int,
	`quantity` int NOT NULL DEFAULT 1,
	`priceAtPurchase` decimal(10,2) NOT NULL,
	`login` varchar(255),
	`password` varchar(255),
	`email` varchar(320),
	`emailPassword` varchar(255),
	`warranty` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`discountAmount` decimal(10,2) DEFAULT '0',
	`totalAmount` decimal(10,2) NOT NULL,
	`couponId` int,
	`couponCode` varchar(50),
	`status` enum('pending','paid','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` longtext NOT NULL,
	`metaDescription` varchar(160),
	`metaKeywords` varchar(255),
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `payment_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paymentId` int NOT NULL,
	`event` varchar(100) NOT NULL,
	`status` varchar(50) NOT NULL,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('pix','paypal','crypto','other') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`config` json,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_methods_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`paymentMethodId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BRL',
	`externalTransactionId` varchar(255),
	`status` enum('pending','processing','completed','failed','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_externalTransactionId_unique` UNIQUE(`externalTransactionId`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`imageUrl` varchar(500) NOT NULL,
	`altText` varchar(255),
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` longtext,
	`platform` varchar(100) NOT NULL,
	`language` varchar(10) NOT NULL,
	`basePrice` decimal(10,2) NOT NULL,
	`discountPercentage` decimal(5,2) DEFAULT '0',
	`finalPrice` decimal(10,2) NOT NULL,
	`totalStock` int NOT NULL,
	`availableStock` int NOT NULL,
	`warranty` varchar(100),
	`type` enum('account','key','gift_card','license','subscription') NOT NULL,
	`tags` json,
	`metaDescription` varchar(160),
	`metaKeywords` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`totalSold` int NOT NULL DEFAULT 0,
	`averageRating` decimal(3,2) DEFAULT '0',
	`reviewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`orderId` int,
	`rating` int NOT NULL,
	`comment` text,
	`isApproved` boolean NOT NULL DEFAULT false,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(100) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`details` json,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`userId` int NOT NULL,
	`message` longtext NOT NULL,
	`senderType` enum('customer','admin') NOT NULL,
	`isInternalNote` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticketNumber` varchar(50) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(50) NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`assignedToAdminId` int,
	`status` enum('open','in_progress','waiting_customer','resolved','closed') NOT NULL DEFAULT 'open',
	`internalNotes` text,
	`resolvedAt` timestamp,
	`closedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_ticketNumber_unique` UNIQUE(`ticketNumber`)
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionToken` varchar(255) NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_sessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`),
	CONSTRAINT `wishlists_userId_productId_idx` UNIQUE(`userId`,`productId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorSecret` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isBlocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `blockedReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `blockedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `lastIpAddress` varchar(45);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `accounts_productId_idx` ON `accounts` (`productId`);--> statement-breakpoint
CREATE INDEX `accounts_status_idx` ON `accounts` (`status`);--> statement-breakpoint
CREATE INDEX `activityLogs_userId_idx` ON `activity_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `activity_logs` (`action`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `activity_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `announcements_isActive_idx` ON `announcements` (`isActive`);--> statement-breakpoint
CREATE INDEX `carts_userId_idx` ON `carts` (`userId`);--> statement-breakpoint
CREATE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `coupons_code_idx` ON `coupons` (`code`);--> statement-breakpoint
CREATE INDEX `coupons_isActive_idx` ON `coupons` (`isActive`);--> statement-breakpoint
CREATE INDEX `favorites_userId_idx` ON `favorites` (`userId`);--> statement-breakpoint
CREATE INDEX `ipBlocklist_ipAddress_idx` ON `ip_blocklist` (`ipAddress`);--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_isRead_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `notifications_createdAt_idx` ON `notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `orderItems_orderId_idx` ON `order_items` (`orderId`);--> statement-breakpoint
CREATE INDEX `orderItems_productId_idx` ON `order_items` (`productId`);--> statement-breakpoint
CREATE INDEX `orders_userId_idx` ON `orders` (`userId`);--> statement-breakpoint
CREATE INDEX `orderNumber_idx` ON `orders` (`orderNumber`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orders_createdAt_idx` ON `orders` (`createdAt`);--> statement-breakpoint
CREATE INDEX `pages_slug_idx` ON `pages` (`slug`);--> statement-breakpoint
CREATE INDEX `paymentLogs_paymentId_idx` ON `payment_logs` (`paymentId`);--> statement-breakpoint
CREATE INDEX `event_idx` ON `payment_logs` (`event`);--> statement-breakpoint
CREATE INDEX `payments_orderId_idx` ON `payments` (`orderId`);--> statement-breakpoint
CREATE INDEX `payments_userId_idx` ON `payments` (`userId`);--> statement-breakpoint
CREATE INDEX `payments_status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `externalTransactionId_idx` ON `payments` (`externalTransactionId`);--> statement-breakpoint
CREATE INDEX `productImages_productId_idx` ON `product_images` (`productId`);--> statement-breakpoint
CREATE INDEX `products_categoryId_idx` ON `products` (`categoryId`);--> statement-breakpoint
CREATE INDEX `products_slug_idx` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `platform_idx` ON `products` (`platform`);--> statement-breakpoint
CREATE INDEX `language_idx` ON `products` (`language`);--> statement-breakpoint
CREATE INDEX `products_isActive_idx` ON `products` (`isActive`);--> statement-breakpoint
CREATE INDEX `isFeatured_idx` ON `products` (`isFeatured`);--> statement-breakpoint
CREATE INDEX `reviews_productId_idx` ON `reviews` (`productId`);--> statement-breakpoint
CREATE INDEX `reviews_userId_idx` ON `reviews` (`userId`);--> statement-breakpoint
CREATE INDEX `reviews_isApproved_idx` ON `reviews` (`isApproved`);--> statement-breakpoint
CREATE INDEX `securityLogs_userId_idx` ON `security_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `eventType_idx` ON `security_logs` (`eventType`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `security_logs` (`severity`);--> statement-breakpoint
CREATE INDEX `securityLogs_createdAt_idx` ON `security_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ticketAttachments_messageId_idx` ON `ticket_attachments` (`messageId`);--> statement-breakpoint
CREATE INDEX `ticketMessages_ticketId_idx` ON `ticket_messages` (`ticketId`);--> statement-breakpoint
CREATE INDEX `ticketMessages_userId_idx` ON `ticket_messages` (`userId`);--> statement-breakpoint
CREATE INDEX `tickets_userId_idx` ON `tickets` (`userId`);--> statement-breakpoint
CREATE INDEX `ticketNumber_idx` ON `tickets` (`ticketNumber`);--> statement-breakpoint
CREATE INDEX `tickets_status_idx` ON `tickets` (`status`);--> statement-breakpoint
CREATE INDEX `priority_idx` ON `tickets` (`priority`);--> statement-breakpoint
CREATE INDEX `userSessions_userId_idx` ON `user_sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `sessionToken_idx` ON `user_sessions` (`sessionToken`);--> statement-breakpoint
CREATE INDEX `wishlists_userId_idx` ON `wishlists` (`userId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `openId_idx` ON `users` (`openId`);