import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertScript, InsertUser, scripts, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createScript(script: InsertScript) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.insert(scripts).values(script);
  return result;
}

export async function getUserScripts(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db
    .select()
    .from(scripts)
    .where(eq(scripts.userId, userId))
    .orderBy((s) => desc(s.createdAt));
}

export async function getScriptById(scriptId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db
    .select()
    .from(scripts)
    .where(and(eq(scripts.id, scriptId), eq(scripts.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateScript(
  scriptId: number,
  userId: number,
  updates: Partial<InsertScript>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db
    .update(scripts)
    .set(updates)
    .where(and(eq(scripts.id, scriptId), eq(scripts.userId, userId)));
}

export async function deleteScript(scriptId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db
    .delete(scripts)
    .where(and(eq(scripts.id, scriptId), eq(scripts.userId, userId)));
}

// TODO: add additional feature queries here as your schema grows.

// Video Transcript Functions
export async function getUserVideoTranscripts(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { videoTranscripts } = await import("../drizzle/schema");
  return await db
    .select()
    .from(videoTranscripts)
    .where(eq(videoTranscripts.userId, userId))
    .orderBy((vt) => desc(vt.createdAt));
}

export async function getVideoTranscriptById(transcriptId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { videoTranscripts } = await import("../drizzle/schema");
  const result = await db
    .select()
    .from(videoTranscripts)
    .where(and(eq(videoTranscripts.id, transcriptId), eq(videoTranscripts.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function saveVideoTranscript(data: any) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { videoTranscripts } = await import("../drizzle/schema");
  return await db.insert(videoTranscripts).values(data);
}

export async function deleteVideoTranscript(transcriptId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { videoTranscripts } = await import("../drizzle/schema");
  return await db
    .delete(videoTranscripts)
    .where(and(eq(videoTranscripts.id, transcriptId), eq(videoTranscripts.userId, userId)));
}
