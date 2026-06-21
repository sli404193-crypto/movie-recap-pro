import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const scripts = mysqlTable("scripts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  movieTitle: varchar("movieTitle", { length: 255 }).notNull(),
  year: int("year"),
  genre: varchar("genre", { length: 100 }),
  plotSummary: text("plotSummary"),
  tone: mysqlEnum("tone", ["Dramatic", "Comedic", "Suspenseful", "Educational", "Casual"]).default("Dramatic").notNull(),
  length: mysqlEnum("length", ["Short", "Medium", "Long"]).default("Medium").notNull(),
  generatedScript: text("generatedScript").notNull(),
  wordCount: int("wordCount").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Script = typeof scripts.$inferSelect;
export type InsertScript = typeof scripts.$inferInsert;

export const videoTranscripts = mysqlTable("videoTranscripts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  videoUrl: varchar("videoUrl", { length: 512 }),
  videoFileName: varchar("videoFileName", { length: 255 }),
  sourceLanguage: mysqlEnum("sourceLanguage", ["English", "Chinese", "Myanmar"]).default("English").notNull(),
  targetLanguage: mysqlEnum("targetLanguage", ["English", "Chinese", "Myanmar"]).default("English").notNull(),
  rawTranscript: text("rawTranscript").notNull(),
  generatedScript: text("generatedScript").notNull(),
  wordCount: int("wordCount").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoTranscript = typeof videoTranscripts.$inferSelect;
export type InsertVideoTranscript = typeof videoTranscripts.$inferInsert;