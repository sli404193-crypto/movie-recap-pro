CREATE TABLE `scripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`movieTitle` varchar(255) NOT NULL,
	`year` int,
	`genre` varchar(100),
	`plotSummary` text,
	`tone` enum('Dramatic','Comedic','Suspenseful','Educational','Casual') NOT NULL DEFAULT 'Dramatic',
	`length` enum('Short','Medium','Long') NOT NULL DEFAULT 'Medium',
	`generatedScript` text NOT NULL,
	`wordCount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scripts_id` PRIMARY KEY(`id`)
);
