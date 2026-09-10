import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

const globalForDatabase = globalThis as unknown as {
  postgres: postgres.Sql | undefined;
};

const client =
  globalForDatabase.postgres ??
  postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.postgres = client;
}

export const db = drizzle(client, { schema });
