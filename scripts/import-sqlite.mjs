#!/usr/bin/env node

/**
 * Import penuh data dari SQLite (data/raf-store.db) ke PostgreSQL.
 *
 * Urutan tabel berdasarkan dependency FK. Konversi tipe:
 *   - SQLite timestamp (epoch ms, integer) -> PG timestamp (Date)
 *   - SQLite boolean (0/1)                 -> PG boolean
 *
 * Usage:
 *   DATABASE_URL=... node scripts/import-sqlite.mjs
 * Prerequisite: schema Postgres sudah di-migrate (`npm run db:migrate`).
 */

import { DatabaseSync } from "node:sqlite";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const source = new DatabaseSync("data/raf-store.db");
const sql = postgres(databaseUrl, { transform: { undefined: null } });

// Urutan insert mengikuti FK: tabel bebas dulu, lalu yang punya FK.
const TABLES = [
  "categories",
  "users",
  "products",
  "carts",
  "hero_campaigns",
  "promo_banners",
  "trust_items",
  "testimonials",
  "articles",
  "site_settings",
  "marketplace_links",
  "newsletter_subscribers",
  "rekening_toko",
  "instruksi_transfer",
  "auth_sessions",
  "cart_items",
  "orders",
  "order_items",
  "product_media",
  "product_badges",
  "stock_movements",
];

async function getColumnTypes(t) {
  const rows = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${t}
    ORDER BY ordinal_position
  `;
  const byName = {};
  for (const r of rows) byName[r.column_name] = r.data_type;
  return byName;
}

function convert(value, type) {
  if (value === null || value === undefined) return null;
  if (type.startsWith("timestamp")) {
    if (typeof value === "number") return new Date(value);
    return value;
  }
  if (type === "boolean") return value === 1 || value === true;
  return value;
}

console.log("Import SQLite -> PostgreSQL\n");

for (const t of TABLES) {
  const colsDesc = source.prepare(`SELECT * FROM ${t}`).columns();
  const colNames = colsDesc.map((c) => c.name);
  if (colNames.length === 0) {
    console.log(`  ${t}: skipped (table not found)`);
    continue;
  }

  const rowsRaw = source.prepare(`SELECT * FROM ${t}`).all();
  const types = await getColumnTypes(t);

  if (rowsRaw.length === 0) {
    console.log(`  ${t}: 0 rows`);
    continue;
  }

  const typedCols = colNames.filter((c) => types[c] !== undefined && types[c] !== null);
  const objects = rowsRaw.map((r) => {
    const o = {};
    for (const c of typedCols) o[c] = convert(r[c], types[c]);
    return o;
  });

  try {
    await sql.begin(async (tx) => {
      await tx`INSERT INTO ${sql(t)} ${sql(objects, ...typedCols)}`;
    });
    console.log(`  ${t}: ${objects.length} rows`);
  } catch (err) {
    console.error(`  ${t}: FAILED ->`, err.message);
    process.exit(1);
  }
}

console.log("\nImport selesai!");
await sql.end();