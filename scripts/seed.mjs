import { randomBytes, scryptSync } from "node:crypto";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = postgres(databaseUrl, { transform: { undefined: null } });

const now = new Date();

function passwordHash(password) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

// ============================================================
// CATEGORIES
// ============================================================
const categories = [
  { id: "cat-ayam", name: "Ayam", slug: "ayam", description: "Produk olahan ayam premium", iconKey: "drumstick", sortOrder: 1 },
  { id: "cat-beef", name: "Beef", slug: "beef", description: "Daging sapi berkualitas tinggi", iconKey: "beef", sortOrder: 2 },
  { id: "cat-seafood", name: "Seafood", slug: "seafood", description: "Hasil laut segar dan berkualitas", iconKey: "fish", sortOrder: 3 },
  { id: "cat-dimsum", name: "Dimsum", slug: "dimsum", description: "Dimsum lezat siap masak", iconKey: "soup", sortOrder: 4 },
  { id: "cat-bakso", name: "Bakso", slug: "bakso", description: "Bakso daging asli", iconKey: "circle", sortOrder: 5 },
  { id: "cat-sosis", name: "Sosis", slug: "sosis", description: "Sosis premium tanpa pengawet", iconKey: "salami", sortOrder: 6 },
  { id: "cat-kentang", name: "Kentang", slug: "kentang", description: "Olahan kentang praktis", iconKey: "potato", sortOrder: 7 },
  { id: "cat-snack", name: "Snack", slug: "snack", description: "Camilan frozen food", iconKey: "cookie", sortOrder: 8 },
  { id: "cat-ready-meal", name: "Ready Meal", slug: "ready-meal", description: "Makanan siap saji tinggal panaskan", iconKey: "utensils", sortOrder: 9 },
  { id: "cat-lainnya", name: "Lainnya", slug: "lainnya", description: "Produk frozen food lainnya", iconKey: "package", sortOrder: 10 },
];

// ============================================================
// PRODUCTS
// ============================================================
const products = [
  {
    id: "product-001", sku: "JFF-AY-001", name: "Chicken Katsu", category: "Ayam", categoryId: "cat-ayam",
    description: "Chicken katsu tepung renyah berbahan daging ayam pilihan. Cocok digoreng atau di-air fryer.",
    shortDescription: "Chicken katsu tepung renyah, praktis masak sebentar.",
    price: 32000, compareAtPrice: 38000, currentStock: 50, weightValue: 500, weightUnit: "g", piecesMin: 5, piecesMax: 5,
    isFeatured: true, isBestSeller: true, isNew: false, isPromo: false,
    articleId: null,
    storageInstructions: "Simpan dalam freezer di bawah -18°C. Baik dikonsumsi dalam 30 hari setelah pembukaan kemasan.",
  },
  {
    id: "product-002", sku: "JFF-AY-002", name: "Chicken Grill Marugame", category: "Ayam", categoryId: "cat-ayam",
    description: "Chicken grill ala Marugame dengan bumbu khas. Daging ayam empuk dengan baluran bumbu gurih.",
    shortDescription: "Chicken grill bumbu khas, empuk dan gurih.",
    price: 35000, compareAtPrice: null, currentStock: 40, weightValue: 500, weightUnit: "g", piecesMin: 5, piecesMax: 5,
    isFeatured: true, isBestSeller: false, isNew: true, isPromo: false,
    articleId: null,
    storageInstructions: "Simpan dalam freezer di bawah -18°C. Baik dikonsumsi dalam 30 hari setelah pembukaan kemasan.",
  },
  {
    id: "product-003", sku: "JFF-AY-003", name: "Cordon Bleu", category: "Ayam", categoryId: "cat-ayam",
    description: "Ayam gulung isi keju mozzarella dan daging smoked beef. Tepung renyah di luar, lembut di dalam.",
    shortDescription: "Ayam gulung isi keju dan smoked beef.",
    price: 38000, compareAtPrice: 42000, currentStock: 35, weightValue: 500, weightUnit: "g", piecesMin: 5, piecesMax: 5,
    isFeatured: true, isBestSeller: false, isPromo: true,
    articleId: null,
    storageInstructions: "Simpan dalam freezer di bawah -18°C. Baik dikonsumsi dalam 30 hari setelah pembukaan kemasan.",
  },
  {
    id: "product-004", sku: "JFF-AY-004", name: "Nugget Keju", category: "Ayam", categoryId: "cat-ayam",
    description: "Nugget ayam dengan isian keju meleleh. Cocok untuk camilan anak dan keluarga.",
    shortDescription: "Nugget ayam isi keju, favorit keluarga.",
    price: 28000, compareAtPrice: null, currentStock: 60, weightValue: 500, weightUnit: "g", piecesMin: 10, piecesMax: 10,
    isFeatured: false, isBestSeller: true, isNew: false, isPromo: false,
    articleId: null,
    storageInstructions: "Simpan dalam freezer di bawah -18°C. Baik dikonsumsi dalam 30 hari setelah pembukaan kemasan.",
  },
  {
    id: "product-005", sku: "JFF-AY-005", name: "Karage Jepang", category: "Ayam", categoryId: "cat-ayam",
    description: "Chicken karage ala Jepang dengan baluran tepung jagung renyah. Bumbu gurih meresap.",
    shortDescription: "Chicken karage Jepang, tepung jagung renyah.",
    price: 33000, compareAtPrice: null, currentStock: 45, weightValue: 500, weightUnit: "g", piecesMin: 8, piecesMax: 8,
    isFeatured: false, isBestSeller: false, isNew: true, isPromo: false,
    articleId: null,
    storageInstructions: "Simpan dalam freezer di bawah -18°C. Baik dikonsumsi dalam 30 hari setelah pembukaan kemasan.",
  },
  {
    id: "product-006", sku: "JFF-SF-001", name: "Ebi Furai", category: "Seafood", categoryId: "cat-seafood",
    description: "Udang goreng tepung berukuran besar. Tepung renyah dengan udang segar berkualitas.",
    shortDescription: "Udang goreng tepung besar, renyah dan segar.",
    price: 42000, compareAtPrice: 48000, currentStock: 30, weightValue: 400, weightUnit: "g", piecesMin: 8, piecesMax: 8,
    isFeatured: true, isBestSeller: true, isPromo: true,
    articleId: null,
    storageInstructions: "Simpan dalam freezer di bawah -18°C. Baik dikonsumsi dalam 30 hari setelah pembukaan kemasan.",
  },
];

// ============================================================
// PRODUCT MEDIA
// ============================================================
const productMedia = [
  { id: "media-001", productId: "product-001", url: "/images/products/chicken-katsu.jpg", altText: "Chicken Katsu", sortOrder: 0 },
  { id: "media-002", productId: "product-002", url: "/images/products/chicken-grill.jpg", altText: "Chicken Grill Marugame", sortOrder: 0 },
  { id: "media-003", productId: "product-003", url: "/images/products/cordon-bleu.jpg", altText: "Cordon Bleu", sortOrder: 0 },
  { id: "media-004", productId: "product-004", url: "/images/products/nugget-keju.jpg", altText: "Nugget Keju", sortOrder: 0 },
  { id: "media-005", productId: "product-005", url: "/images/products/karage-jepang.jpg", altText: "Karage Jepang", sortOrder: 0 },
  { id: "media-006", productId: "product-006", url: "/images/products/ebi-furai.jpg", altText: "Ebi Furai", sortOrder: 0 },
];

// ============================================================
// HERO CAMPAIGNS
// ============================================================
const heroes = [
  {
    id: "hero-001",
    eyebrow: "Jasmine Shop Premium Product",
    title: "Frozen Food Premium",
    highlightedText: "Praktis Seperti Masakan Restoran",
    description: "Lebih dari 100 produk premium pilihan. Cocok untuk keluarga, reseller, UMKM hingga kebutuhan horeca.",
    imageUrl: "/images/hero/hero-main.jpg",
    imageAlt: "Jasmine Shop Premium Product — Frozen Food Premium",
    primaryCtaLabel: "Lihat Katalog",
    primaryCtaUrl: "/produk",
    secondaryCtaLabel: "Hubungi Kami",
    secondaryCtaUrl: "https://wa.me/62817771020",
    sortOrder: 0,
  },
];

// ============================================================
// PROMO BANNERS
// ============================================================
const promos = [
  {
    id: "promo-001", title: "Paket Hemat Keluarga", subtitle: "Beli 3 GRATIS 1", badgeText: "HEMAT",
    imageUrl: "/images/promo/paket-keluarga.jpg", backgroundVariant: "red",
    ctaLabel: "Pesan Sekarang", ctaUrl: "/produk?promo=true",
    placement: "homepage", sortOrder: 0,
  },
  {
    id: "promo-002", title: "Reseller Harga Spesial", subtitle: "Diskon hingga 25% untuk pembelian grosir",
    badgeText: "RESELLER", imageUrl: "/images/promo/reseller.jpg",
    backgroundVariant: "cream", ctaLabel: "Daftar Reseller", ctaUrl: "https://wa.me/62817771020?text=Halo,%20saya%20mau%20daftar%20reseller",
    placement: "homepage", sortOrder: 1,
  },
  {
    id: "promo-003", title: "Gratis Ongkir", subtitle: "Pembelian minimal Rp50.000",
    badgeText: "PROMO", imageUrl: "/images/promo/gratis-ongkir.jpg",
    backgroundVariant: "green", ctaLabel: "Belanja Sekarang", ctaUrl: "/produk",
    placement: "homepage", sortOrder: 2,
  },
];

// ============================================================
// TRUST ITEMS
// ============================================================
const trustItems = [
  { id: "trust-001", iconKey: "award", title: "Kualitas Premium", description: "Bahan pilihan terbaik untuk produk frozen food kami.", sortOrder: 0 },
  { id: "trust-002", iconKey: "thermometer", title: "Rantai Dingin Terjaga", description: "Kesegaran sampai tujuan dengan pengemasan khusus.", sortOrder: 1 },
  { id: "trust-003", iconKey: "shield", title: "Kemasan Food Grade", description: "Higienis dan berkualitas untuk keamanan makanan.", sortOrder: 2 },
  { id: "trust-004", iconKey: "truck", title: "Pengiriman Cepat", description: "Area pengiriman sesuai konfigurasi.", sortOrder: 3 },
];

// ============================================================
// TESTIMONIALS
// ============================================================
const testimonials = [
  { id: "testi-001", customerName: "Ibu Rina", customerTitle: "Ibu Rumah Tangga", quote: "Chicken katsunya renyah banget! Anak-anak suka. Praktis tinggal goreng.", rating: 5, sortOrder: 0 },
  { id: "testi-002", customerName: "Pak Budi", customerTitle: "Pemilik Café", quote: "Kualitas frozen food-nya konsisten. Cocok untuk menu café kami.", rating: 5, sortOrder: 1 },
  { id: "testi-003", customerName: "Mba Sari", customerTitle: "Reseller", quote: "Pengiriman selalu tepat waktu dan kemasannya rapi. Pelanggan puas.", rating: 5, sortOrder: 2 },
];

// ============================================================
// MARKETPLACE LINKS
// ============================================================
const marketplaces = [
  { id: "mp-001", marketplace: "tokopedia", label: "Tokopedia", url: "https://tokopedia.com/jasmineshop", logoUrl: "/images/marketplace/tokopedia.svg", sortOrder: 0 },
  { id: "mp-002", marketplace: "shopee", label: "Shopee", url: "https://shopee.co.id/jasmineshop", logoUrl: "/images/marketplace/shopee.svg", sortOrder: 1 },
  { id: "mp-003", marketplace: "whatsapp", label: "WhatsApp", url: "https://wa.me/62817771020", logoUrl: "/images/marketplace/whatsapp.svg", sortOrder: 2 },
];

// ============================================================
// BANK ACCOUNTS
// ============================================================
const accounts = [
  { id: "bank-bca", bankName: "BCA", accountNumber: "1234567890", holder: "JASMIN FROZEN FOOD", instruction: "Transfer sesuai total pembayaran.", order: 1 },
  { id: "bank-mandiri", bankName: "Bank Mandiri", accountNumber: "9876543210012", holder: "JASMIN FROZEN FOOD", instruction: "Cantumkan nomor pesanan pada berita transfer.", order: 2 },
];

// ============================================================
// TRANSFER INSTRUCTIONS
// ============================================================
const instructions = [
  { id: "instruction-1", title: "Transfer sesuai total", text: "Transfer tepat sesuai total pembayaran yang tertera.", order: 1 },
  { id: "instruction-2", title: "Gunakan rekening resmi", text: "Pastikan rekening tujuan atas nama JASMIN FROZEN FOOD.", order: 2 },
  { id: "instruction-3", title: "Simpan bukti", text: "Simpan bukti transfer lalu unggah pada langkah konfirmasi.", order: 3 },
  { id: "instruction-4", title: "Tunggu verifikasi", text: "Pesanan diproses setelah pembayaran diverifikasi admin.", order: 4 },
];

// ============================================================
// QRIS SETTINGS
// ============================================================
const qris = {
  id: "default",
  label: "QRIS",
  merchantName: "JASMINE SHOP PREMIUM PRODUCT",
  payId: "JA-12345678901",
  qrImageUrl: "",
  instruction: "Scan QR lalu bayar sesuai total. Simpan bukti untuk verifikasi.",
  isActive: true,
};

// ============================================================
// EXECUTE SEED
// ============================================================
console.log("Seeding Jasmine Shop Premium Product...\n");

try {
  await sql.begin(async (tx) => {
    // Categories
    for (const cat of categories) {
      await tx`
        INSERT INTO categories (id, name, slug, description, icon_key, sort_order, is_active, created_at, updated_at)
        VALUES (${cat.id}, ${cat.name}, ${cat.slug}, ${cat.description}, ${cat.iconKey}, ${cat.sortOrder}, true, ${now}, ${now})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description,
          icon_key = EXCLUDED.icon_key, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active,
          updated_at = EXCLUDED.updated_at
      `;
    }
    console.log(`  Categories: ${categories.length}`);

    // Products
    for (const p of products) {
      const slug = p.name.toLowerCase().replace(/\s+/g, "-");
      const imageUrl = `/images/products/${slug}.jpg`;
      await tx`
        INSERT INTO products (
          id, sku, name, category, category_id, description, short_description,
          price, compare_at_price, current_stock, image_url, is_active,
          slug, weight_value, weight_unit, pieces_min, pieces_max,
          is_featured, is_best_seller, is_new, is_promo,
          storage_instructions, created_at, updated_at
        ) VALUES (
          ${p.id}, ${p.sku}, ${p.name}, ${p.category}, ${p.categoryId}, ${p.description}, ${p.shortDescription},
          ${p.price}, ${p.compareAtPrice}, ${p.currentStock}, ${imageUrl}, true,
          ${slug}, ${p.weightValue}, ${p.weightUnit}, ${p.piecesMin}, ${p.piecesMax},
          ${p.isFeatured ? true : false}, ${p.isBestSeller ? true : false}, ${p.isNew ? true : false}, ${p.isPromo ? true : false},
          ${p.storageInstructions}, ${now}, ${now}
        )
        ON CONFLICT (id) DO UPDATE SET
          sku = EXCLUDED.sku, name = EXCLUDED.name, category = EXCLUDED.category,
          category_id = EXCLUDED.category_id, description = EXCLUDED.description,
          short_description = EXCLUDED.short_description, price = EXCLUDED.price,
          compare_at_price = EXCLUDED.compare_at_price, current_stock = EXCLUDED.current_stock,
          image_url = EXCLUDED.image_url, is_active = EXCLUDED.is_active, slug = EXCLUDED.slug,
          weight_value = EXCLUDED.weight_value, weight_unit = EXCLUDED.weight_unit,
          pieces_min = EXCLUDED.pieces_min, pieces_max = EXCLUDED.pieces_max,
          is_featured = EXCLUDED.is_featured, is_best_seller = EXCLUDED.is_best_seller,
          is_new = EXCLUDED.is_new, is_promo = EXCLUDED.is_promo,
          storage_instructions = EXCLUDED.storage_instructions,
          updated_at = EXCLUDED.updated_at
      `;
    }
    console.log(`  Products: ${products.length}`);

    // Product media — delete existing first to avoid duplicates from backfill
    const mediaProductIds = productMedia.map((m) => m.productId);
    await tx`DELETE FROM product_media WHERE product_id = ANY(${mediaProductIds})`;
    for (const m of productMedia) {
      await tx`
        INSERT INTO product_media (id, product_id, media_type, url, alt_text, title, sort_order, is_primary, created_at, updated_at)
        VALUES (${m.id}, ${m.productId}, 'image', ${m.url}, ${m.altText}, '', ${m.sortOrder}, true, ${now}, ${now})
      `;
    }
    console.log(`  Product media: ${productMedia.length}`);

    // Hero campaigns
    for (const h of heroes) {
      await tx`
        INSERT INTO hero_campaigns (id, eyebrow, title, highlighted_text, description, image_url, image_alt, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url, sort_order, is_active, created_at, updated_at)
        VALUES (${h.id}, ${h.eyebrow}, ${h.title}, ${h.highlightedText}, ${h.description}, ${h.imageUrl}, ${h.imageAlt}, ${h.primaryCtaLabel}, ${h.primaryCtaUrl}, ${h.secondaryCtaLabel}, ${h.secondaryCtaUrl}, ${h.sortOrder}, true, ${now}, ${now})
        ON CONFLICT (id) DO UPDATE SET
          eyebrow = EXCLUDED.eyebrow, title = EXCLUDED.title, highlighted_text = EXCLUDED.highlighted_text,
          description = EXCLUDED.description, image_url = EXCLUDED.image_url, image_alt = EXCLUDED.image_alt,
          primary_cta_label = EXCLUDED.primary_cta_label, primary_cta_url = EXCLUDED.primary_cta_url,
          secondary_cta_label = EXCLUDED.secondary_cta_label, secondary_cta_url = EXCLUDED.secondary_cta_url,
          sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active, updated_at = EXCLUDED.updated_at
      `;
    }
    console.log(`  Hero campaigns: ${heroes.length}`);

    // Promo banners
    for (const p of promos) {
      await tx`
        INSERT INTO promo_banners (id, title, subtitle, badge_text, image_url, background_variant, cta_label, cta_url, placement, sort_order, is_active)
        VALUES (${p.id}, ${p.title}, ${p.subtitle}, ${p.badgeText}, ${p.imageUrl}, ${p.backgroundVariant}, ${p.ctaLabel}, ${p.ctaUrl}, ${p.placement}, ${p.sortOrder}, true)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, badge_text = EXCLUDED.badge_text,
          image_url = EXCLUDED.image_url, background_variant = EXCLUDED.background_variant,
          cta_label = EXCLUDED.cta_label, cta_url = EXCLUDED.cta_url,
          placement = EXCLUDED.placement, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
      `;
    }
    console.log(`  Promo banners: ${promos.length}`);

    // Trust items
    for (const t of trustItems) {
      await tx`
        INSERT INTO trust_items (id, icon_key, title, description, sort_order, is_active)
        VALUES (${t.id}, ${t.iconKey}, ${t.title}, ${t.description}, ${t.sortOrder}, true)
        ON CONFLICT (id) DO UPDATE SET
          icon_key = EXCLUDED.icon_key, title = EXCLUDED.title,
          description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
      `;
    }
    console.log(`  Trust items: ${trustItems.length}`);

    // Testimonials
    for (const t of testimonials) {
      await tx`
        INSERT INTO testimonials (id, customer_name, customer_title, quote, rating, sort_order, is_published, created_at)
        VALUES (${t.id}, ${t.customerName}, ${t.customerTitle}, ${t.quote}, ${t.rating}, ${t.sortOrder}, true, ${now})
        ON CONFLICT (id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name, customer_title = EXCLUDED.customer_title,
          quote = EXCLUDED.quote, rating = EXCLUDED.rating, sort_order = EXCLUDED.sort_order,
          is_published = EXCLUDED.is_published
      `;
    }
    console.log(`  Testimonials: ${testimonials.length}`);

    // Site settings
    await tx`
      INSERT INTO site_settings (
        id, brand_name, tagline, logo_url, whatsapp_number, email, address, operating_hours,
        free_shipping_threshold, instagram_url, tiktok_url, youtube_url, facebook_url, updated_at
      ) VALUES (
        'default', 'Jasmine Shop Premium Product', 'Frozen Food Premium untuk keluarga Indonesia.',
        '/images/logo/logo_jusmine.png', '62817771020', 'info@jasmineshop.id',
        'Jl. Contoh No. 123, Jakarta Selatan', 'Senin–Sabtu 08:00–17:00 WIB',
        50000, 'https://instagram.com/jasmineshop.id',
        'https://tiktok.com/@jasmineshop.id', null, null, ${now}
      )
      ON CONFLICT (id) DO UPDATE SET
        brand_name = EXCLUDED.brand_name, tagline = EXCLUDED.tagline, logo_url = EXCLUDED.logo_url,
        whatsapp_number = EXCLUDED.whatsapp_number, email = EXCLUDED.email, address = EXCLUDED.address,
        operating_hours = EXCLUDED.operating_hours, free_shipping_threshold = EXCLUDED.free_shipping_threshold,
        instagram_url = EXCLUDED.instagram_url, tiktok_url = EXCLUDED.tiktok_url,
        youtube_url = EXCLUDED.youtube_url, facebook_url = EXCLUDED.facebook_url,
        updated_at = EXCLUDED.updated_at
    `;
    console.log(`  Site settings: 1`);

    // Marketplace links
    for (const m of marketplaces) {
      await tx`
        INSERT INTO marketplace_links (id, marketplace, label, url, logo_url, sort_order, is_active)
        VALUES (${m.id}, ${m.marketplace}, ${m.label}, ${m.url}, ${m.logoUrl}, ${m.sortOrder}, true)
        ON CONFLICT (id) DO UPDATE SET
          marketplace = EXCLUDED.marketplace, label = EXCLUDED.label, url = EXCLUDED.url,
          logo_url = EXCLUDED.logo_url, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
      `;
    }
    console.log(`  Marketplace links: ${marketplaces.length}`);

    // Bank accounts
    for (const a of accounts) {
      await tx`
        INSERT INTO rekening_toko (id, bank_name, account_number, account_holder_name, instruction, is_active, display_order, created_at, updated_at)
        VALUES (${a.id}, ${a.bankName}, ${a.accountNumber}, ${a.holder}, ${a.instruction}, true, ${a.order}, ${now}, ${now})
        ON CONFLICT (id) DO UPDATE SET
          bank_name = EXCLUDED.bank_name, account_number = EXCLUDED.account_number,
          account_holder_name = EXCLUDED.account_holder_name, instruction = EXCLUDED.instruction,
          is_active = EXCLUDED.is_active, display_order = EXCLUDED.display_order, updated_at = EXCLUDED.updated_at
      `;
    }
    console.log(`  Bank accounts: ${accounts.length}`);

    // Transfer instructions
    for (const i of instructions) {
      await tx`
        INSERT INTO instruksi_transfer (id, title, instruction, step_order, is_active, created_at, updated_at)
        VALUES (${i.id}, ${i.title}, ${i.text}, ${i.order}, true, ${now}, ${now})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title, instruction = EXCLUDED.instruction,
          step_order = EXCLUDED.step_order, is_active = EXCLUDED.is_active, updated_at = EXCLUDED.updated_at
      `;
    }
    console.log(`  Transfer instructions: ${instructions.length}`);

    // QRIS settings
    await tx`
      INSERT INTO qris_settings (id, label, merchant_name, pay_id, qr_image_url, instruction, is_active, created_at, updated_at)
      VALUES (${qris.id}, ${qris.label}, ${qris.merchantName}, ${qris.payId}, ${qris.qrImageUrl}, ${qris.instruction}, ${qris.isActive}, ${now}, ${now})
      ON CONFLICT (id) DO UPDATE SET
        label = EXCLUDED.label, merchant_name = EXCLUDED.merchant_name, pay_id = EXCLUDED.pay_id,
        qr_image_url = EXCLUDED.qr_image_url, instruction = EXCLUDED.instruction,
        is_active = EXCLUDED.is_active, updated_at = EXCLUDED.updated_at
    `;
    console.log("  QRIS settings: 1");

    // Shipping settings - created once disabled; reseeding must NOT overwrite admin config
    await tx`
      INSERT INTO shipping_settings (
        id, enable_regular, enable_same_day, enable_instant, default_method, same_day_fixed_cost, flat_delivery_cost, updated_at
      ) VALUES (
        'default', true, true, true, 'regular', 25000, 20000, ${now}
      )
      ON CONFLICT (id) DO NOTHING
    `;
    console.log("  Shipping settings: 1");

    // Users
    await tx`
      INSERT INTO users (id, role, name, email, email_verified, phone, password_hash, created_at, updated_at)
      VALUES ('admin-jasmine', 'admin', 'Admin Jasmine', 'admin@jasmineshop.id', true, '081111111111', ${passwordHash("Admin#Jasmine2026")}, ${now}, ${now})
      ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role, name = EXCLUDED.name, email = EXCLUDED.email,
        email_verified = EXCLUDED.email_verified, phone = EXCLUDED.phone,
        password_hash = EXCLUDED.password_hash, updated_at = EXCLUDED.updated_at
    `;
    await tx`
      INSERT INTO users (id, role, name, email, email_verified, phone, password_hash, created_at, updated_at)
      VALUES ('customer-demo', 'customer', 'Rafi Ahmad', 'rafi.ahmad@example.com', true, '081234567890', ${passwordHash("Jasmine#2026")}, ${now}, ${now})
      ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role, name = EXCLUDED.name, email = EXCLUDED.email,
        email_verified = EXCLUDED.email_verified, phone = EXCLUDED.phone,
        password_hash = EXCLUDED.password_hash, updated_at = EXCLUDED.updated_at
    `;
    console.log(`  Users: 2`);

    // NOTE: seed ini TIDAK menonaktifkan produk/kategori di luar daftar seed
    // (non-destruktif). Katalog upload (/uploads/) milik toko tetap aktif.
  });

  console.log("\nSeed selesai!");
} catch (err) {
  console.error("Seed gagal:", err);
  process.exit(1);
} finally {
  await sql.end();
}
