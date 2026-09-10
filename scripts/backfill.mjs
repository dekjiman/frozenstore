#!/usr/bin/env node

/**
 * Backfill script for Jasmine Frozen Food revamp.
 *
 * This script backfills data from legacy columns to new tables:
 * 1. Creates categories from unique products.category values
 * 2. Creates product_media rows from products.image_url
 * 3. Generates products.slug from products.name
 *
 * Usage:
 *   node scripts/backfill.mjs
 *
 * Prerequisites:
 *   - Run `npm run db:generate` and `npm run db:migrate` first
 *   - DATABASE_URL environment variable must be set
 */

import { randomBytes } from "node:crypto";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = postgres(databaseUrl, { transform: { undefined: null } });

function generateId() {
  return randomBytes(16).toString("hex");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

console.log("Starting backfill...");

try {
  await sql.begin(async (tx) => {
    // 1. Backfill categories from products.category
    console.log("\n1. Backfilling categories...");
    const uniqueCategories = await tx`
      SELECT DISTINCT category FROM products
      WHERE category IS NOT NULL AND category != ''
    `;

    let categoryCount = 0;
    const now = new Date();

    for (let i = 0; i < uniqueCategories.length; i++) {
      const { category } = uniqueCategories[i];
      const id = `cat-${slugify(category)}`;
      const slug = slugify(category);

      await tx`
        INSERT INTO categories (id, name, slug, description, sort_order, is_active, created_at, updated_at)
        VALUES (${id}, ${category}, ${slug}, '', ${i + 1}, true, ${now}, ${now})
        ON CONFLICT (id) DO NOTHING
      `;
      await tx`
        UPDATE products SET category_id = ${id} WHERE category = ${category}
      `;
      categoryCount++;
    }
    console.log(`   Created ${categoryCount} categories`);

    // 2. Backfill product_media from products.image_url
    console.log("\n2. Backfilling product_media...");
    const productsWithImages = await tx`
      SELECT id, image_url FROM products
      WHERE image_url IS NOT NULL AND image_url != ''
    `;

    let mediaCount = 0;

    for (const product of productsWithImages) {
      const id = generateId();
      await tx`
        INSERT INTO product_media (id, product_id, media_type, url, alt_text, title, sort_order, is_primary, created_at, updated_at)
        VALUES (${id}, ${product.id}, 'image', ${product.image_url}, '', '', 0, true, ${now}, ${now})
      `;
      mediaCount++;
    }
    console.log(`   Created ${mediaCount} product_media rows`);

    // 3. Backfill products.slug from products.name
    console.log("\n3. Backfilling product slugs...");
    const productsWithoutSlug = await tx`
      SELECT id, name FROM products WHERE slug IS NULL OR slug = ''
    `;

    let slugCount = 0;

    for (const product of productsWithoutSlug) {
      let baseSlug = slugify(product.name);
      let slug = baseSlug;
      let counter = 1;

      // Find a unique slug
      while (true) {
        const existing = await tx`
          SELECT id FROM products WHERE slug = ${slug} AND id != ${product.id}
        `;
        if (existing.length === 0) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      await tx`
        UPDATE products SET slug = ${slug} WHERE id = ${product.id}
      `;
      slugCount++;
    }
    console.log(`   Updated ${slugCount} product slugs`);
  });

  console.log("\nBackfill complete!");
} catch (err) {
  console.error("Backfill failed:", err);
  process.exit(1);
} finally {
  await sql.end();
}
