CREATE TABLE `accountBalances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`currency` enum('دولار','يورو','ليرة سورية','آخر') NOT NULL,
	`balance` decimal(15,2) NOT NULL DEFAULT '0',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accountBalances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accountStatements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`transactionId` int NOT NULL,
	`debit` decimal(15,2) NOT NULL DEFAULT '0',
	`credit` decimal(15,2) NOT NULL DEFAULT '0',
	`runningBalance` decimal(15,2) NOT NULL DEFAULT '0',
	`description` text,
	`statementDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountStatements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`accountType` enum('زبون','مكتب','مندوب','آخر') NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`quantity` decimal(15,2) NOT NULL,
	`unit` varchar(50),
	`unitPrice` decimal(15,2),
	`totalValue` decimal(15,2),
	`notes` text,
	`inventoryDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`currency` enum('دولار','يورو','ليرة سورية','آخر') NOT NULL,
	`description` text,
	`type` enum('لنا','لهم') NOT NULL,
	`transactionDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
