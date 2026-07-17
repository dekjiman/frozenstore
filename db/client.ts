import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL ?? "./data/raf-store.db";

const globalForDatabase = globalThis as unknown as {
  sqlite: Database.Database | undefined;
};

const sqlite = globalForDatabase.sqlite ?? new Database(databaseUrl);

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.sqlite = sqlite;
}

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
