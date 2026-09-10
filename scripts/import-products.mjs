#!/usr/bin/env node

/**
 * Import katalog produk baru (dari spreadsheet pemilik toko) ke PostgreSQL.
 * Dedup berdasarkan SKU — produk yang SKU-nya sudah ada TIDAK dimasukkan lagi.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/import-products.mjs
 */

import { randomUUID } from "node:crypto";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const PLACEHOLDER_IMAGE = "/uploads/products/placeholder.svg";

// [sku, name, description, category, price]
const ROWS = [
  ["CHGR-MRG-700", "Chicken Grill Marugame", "Daging paha ayam premium, juicy, lembut, manis gurih. Isi 10 pcs, berat 700 gr.", "Chicken", 90000],
  ["BCLS-ORI-700", "Boneless Chicken Original", "Tidak pedas, daging ayam lembut dengan tepung renyah. Berat 700 gr, isi 7-8 pcs.", "Chicken", 85000],
  ["BCLS-SPC-700", "Boneless Chicken Spicy", "Boneless chicken pedas dengan daging ayam lembut dan tepung renyah. Berat 700 gr, isi 7-8 pcs.", "Chicken", 85000],
  ["CLMR-500", "Calamari Rings", "Calamari premium siap masak, gurih dan renyah. Berat 500 gr.", "Seafood", 85000],
  ["KRG-JPN-1KG", "Karage Jepang", "Karage ayam ala Jepang, praktis dan siap digoreng. Berat 1 kg.", "Chicken", 110000],
  ["STK-WGY-1KG", "Steak Wagyu", "Steak wagyu premium. Berat 1 kg, isi 10 pcs.", "Beef", 130000],
  ["CHCB-600", "Chicken Cheeseball", "Chicken cheese ball dengan rasa ayam lebih terasa. Berat 600 gr, isi 20 pcs.", "Chicken", 65000],
  ["CHWG-1KG", "Chicken Wing Premium", "Chicken wings premium rasa manis gurih. Berat 1 kg.", "Chicken", 105000],
  ["SOS-HTL-1KG", "Sosis Hotel", "Sosis premium ala hotel. Berat 1 kg, isi sekitar 45 pcs.", "Sausage", 100000],
  ["CRDB-1KG", "Cordon Bleu Jumbo", "Chicken cordon bleu premium ukuran jumbo. Berat 1 kg, isi 8 pcs.", "Chicken", 105000],
  ["KTWG-1KG", "Kentang Wedges Bumbu", "Kentang wedges berbumbu, praktis tinggal digoreng atau air fryer. Berat 1 kg.", "Potato", 85000],
  ["KTWF-1KG", "Kentang Waffle BK", "Kentang waffle premium, crispy di luar dan lembut di dalam. Berat 1 kg.", "Potato", 90000],
  ["CHKT-1KG", "Chicken Katsu Premium", "Daging ayam tebal dengan tepung panir tipis dan renyah. Berat 1 kg, isi 13 pcs.", "Chicken", 105000],
  ["SMY-YSH-30", "Siomay Yoshinoya", "Siomay gurih ala Jepang dengan campuran ayam cincang dan sayuran. Isi 30 pcs.", "Dimsum", 85000],
  ["UDPOP-500", "Udang Pop", "Udang asli berbalut tepung crunchy. Berat 500 gr.", "Seafood", 65000],
  ["UDKJ-10", "Udang Keju Gacoan", "Olahan udang dan keju premium, praktis siap goreng. Isi 10 pcs.", "Seafood", 55000],
  ["PMPK-15", "Pempek Ikan Tenggiri Premium", "Pempek ikan tenggiri premium: adaan, kapal selam dan lenjer. Isi 15 pcs.", "Seafood", 65000],
  ["BKSO-50", "Bakso Sapi Premium", "Bakso sapi premium dengan tekstur halus dan kenyal. Isi 50 pcs.", "Meatball", 80000],
  ["WNTN-100", "Mini Wonton Goreng", "Wonton isi campuran ikan, udang, ayam dan cumi. Berat 500 gr, isi 100 pcs, tanpa saus.", "Dimsum", 85000],
  ["PNGT-RBS-24", "Pangsit Rebus Ayam & Udang", "Pangsit rebus dengan isian ayam dan udang. Berat 500 gr, isi 24 pcs.", "Dimsum", 70000],
  ["VGKD-10", "Vegekado Fish", "Olahan ikan premium. Isi 10 tusuk.", "Seafood", 55000],
  ["DMSM-50", "Dimsum Hemat", "Dimsum frozen paket hemat. Berat 1.2 kg, isi 50 pcs.", "Dimsum", 100000],
  ["LMPA-12", "Lumpia Ayam", "Lumpia dengan isian ayam gurih, praktis siap goreng. Isi 12 pcs.", "Dimsum", 65000],
  ["CKWU-12", "Cakwe Udang", "Cakwe dengan isian udang gurih. Isi 12 pcs.", "Dimsum", 65000],
  ["PNGT-GRG-12", "Pangsit Goreng", "Pangsit frozen siap goreng dengan isian gurih. Isi 12 pcs.", "Dimsum", 55000],
  ["BEEF-SPL-500", "Beef Slice Marinasi Shortplate", "Beef slice shortplate marinasi premium 500 gr. Varian BBQ dan Bulgogi.", "Beef", 70000],
  ["PDS-AYK", "Pedesan Ayam Kampung", "Pedesan ayam kampung berbumbu, porsi sekitar 4 orang.", "Ready Meal", 60000],
  ["AYK-UNGK", "Ayam Kampung Ungkep", "1 box isi 3 pcs besar / 4 pcs sedang / 5 pcs kecil.", "Ready Meal", 80000],
  ["UDTP-MRG-10", "Udang Tempura Marugame", "Udang tempura premium, udang besar ukuran 21/25, renyah dan full udang. Isi 10 pcs.", "Seafood", 0],
  ["BEEF-MRN-500", "Beef Marinasi Premium", "Daging sapi import Australia, empuk dan juicy. 500 gr. Varian Gochujang, Teriyaki, Yakiniku, BBQ, Bulgogi, Black Pepper.", "Beef", 0],
  ["BRST-FRC-700", "Breast Fried Chicken Resto", "Daging ayam tebal dan empuk dibalut tepung renyah. Berat 700 gr.", "Chicken", 0],
  ["BNLS-WNG-700", "Boneless Wings Resto", "Daging ayam sayap yang gurih dan nikmat. Berat 700 gr.", "Chicken", 0],
  ["CHS-NGT-1KG", "Cheese Chicken Nugget", "Chicken nugget dengan potongan keju di dalamnya. Berat 1 kg.", "Chicken", 0],
  ["ABON-CKL-250", "Abon Cakalang", "Abon ikan cakalang siap santap. Berat 250 gr.", "Seafood", 0],
  ["CKLT-KRK-1KG", "Coklat Kerikil Cikoleb", "Import dari Arab, Premium Grade A++, manis, crunchy dan tidak getir. Berat 1 kg.", "Snack", 0],
  ["BJK-KTP-500", "Biji Ketapang Oven", "Homemade tanpa pengawet, dipanggang menggunakan oven dan tidak keras. Berat 500 gr.", "Snack", 0],
  ["ONGOL", "Ongol-Ongol", "Jajanan tradisional khas Betawi dengan tekstur kenyal dan balutan kelapa parut.", "Traditional Snack", 0],
  ["BLUB-CKLT", "Bola Ubi Coklat Lumer", "Bola ubi dengan bagian luar renyah dan isian coklat lumer.", "Snack", 0],
  ["CHST-EDM-250", "Cheese Stick Edam", "Cheese stick dengan keju Edam, renyah dan gurih. Berat 250 gr.", "Snack", 0],
  ["CNDL-KMPLT", "Cendol Sepaket Komplit", "Paket cendol terdiri dari cendol 1 kg, santan dan gula Jawa.", "Dessert", 0],
  ["PARU-MTH-200", "Paru Sambal Matah", "Paru sambal matah vacuum pack. Berat 200 gr.", "Ready Meal", 0],
  ["PARU-GRG-10", "Paru Goreng + Sambal", "Paru goreng gurih dengan sambal terpisah. Isi 10 pcs.", "Ready Meal", 0],
  ["PARU-BLD-10", "Dendeng Paru Balado", "Dendeng paru balado isi 10 pcs dengan sambal yang bisa dipisah.", "Ready Meal", 0],
  ["CUMI-CI-200", "Cumi Cabe Ijo", "Cumi cabe ijo vacuum pack dengan rasa pedas gurih. Berat 200 gr.", "Seafood", 0],
  ["TNGKL-SWR-200", "Tongkol Suwir", "Tongkol suwir berbumbu vacuum pack. Berat 200 gr.", "Seafood", 0],
  ["SMBL-BWG-230", "Sambal Bawang Jadul", "Sambal bawang jadul pedas gurih. Berat 230 gr.", "Sambal", 0],
  ["PARU-UNGK-10", "Paru Ungkep", "Paru ungkep siap goreng isi 10 pcs plus sambal, aman disimpan di freezer.", "Ready Meal", 0],
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

const sql = postgres(databaseUrl, { transform: { undefined: null } });

async function main() {
  const existingSkus = new Set((await sql`select sku from products`).map((r) => r.sku));
  const existingSlugs = new Set((await sql`select slug from products`).map((r) => r.slug).filter(Boolean));
  const categories = await sql`select id, lower(name) as lname from categories`;
  const categoryIdByName = new Map(categories.map((c) => [c.lname, c.id]));

  let inserted = 0;
  let skipped = 0;

  for (const [sku, name, description, category, price] of ROWS) {
    if (existingSkus.has(sku)) {
      console.log(`  skip (SKU sudah ada): ${sku} — ${name}`);
      skipped += 1;
      continue;
    }

    let slug = slugify(`${sku} ${name}`);
    const base = slug;
    let i = 2;
    while (existingSlugs.has(slug)) slug = `${base}-${i++}`;
    existingSlugs.add(slug);

    await sql`
      insert into products (
        id, sku, name, category, description, price, current_stock, image_url,
        is_active, slug, short_description, weight_value, weight_unit,
        pieces_min, pieces_max, is_featured, is_best_seller, is_new, is_promo,
        rating_average, rating_count, sold_count, storage_instructions,
        seo_title, seo_description, category_id, created_at, updated_at
      ) values (
        ${randomUUID()}, ${sku}, ${name}, ${category}, ${description}, ${price}, 0, ${PLACEHOLDER_IMAGE},
        ${price > 0}, ${slug}, ${description}, null, 'g',
        null, null, false, false, false, false,
        0, 0, 0, '',
        ${`${name} — Jasmine Frozen Food`}, ${description}, ${categoryIdByName.get(category.toLowerCase()) ?? null},
        ${new Date()}, ${new Date()}
      )
    `;

    inserted += 1;
    console.log(`  insert: ${sku} — ${name}${price === 0 ? " (nonaktif, harga 0)" : ""}`);
  }

  console.log(`\nSelesai. Dimasukkan: ${inserted}, dilewati (sudah ada): ${skipped}.`);
  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});