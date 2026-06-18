CREATE TABLE `videoTranscripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoUrl` varchar(512),
	`videoFileName` varchar(255),
	`sourceLanguage` enum('English','Chinese','Myanmar') NOT NULL DEFAULT 'English',
	`targetLanguage` enum('English','Chinese','Myanmar') NOT NULL DEFAULT 'English',
	`rawTranscript` text NOT NULL,
	`generatedScript` text NOT NULL,
	`wordCount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videoTranscripts_id` PRIMARY KEY(`id`)
);
