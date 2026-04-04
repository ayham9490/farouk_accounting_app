CREATE TABLE `batchTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`currency` enum('دولار','يورو','ليرة سورية','آخر') NOT NULL,
	`description` text,
	`type` enum('لنا','لهم') NOT NULL,
	`transactionDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batchTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `euroExchanges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`officeId` int NOT NULL,
	`euroAmount` decimal(15,2) NOT NULL,
	`exchangeRate` decimal(15,4) NOT NULL,
	`dollarAmount` decimal(15,2) NOT NULL,
	`exchangeDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `euroExchanges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
