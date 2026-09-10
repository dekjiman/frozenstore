# CMS Specification — Admin-Editable Content

> Everything an admin can change without code deploy. Each section below maps to
> an admin UI panel and its backing API endpoint.

---

## 1. Hero Campaigns

**Admin route:** `/admin/heroes`
**API:** `GET/POST /api/admin/heroes`, `PATCH/DELETE /api/admin/heroes/:id`

### Editable Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eyebrow` | text | No | Small label above headline (e.g., "Promo Spesial") |
| `title` | text | Yes | Main headline |
| `highlighted_text` | text | No | Text to highlight within title |
| `description` | text | No | Supporting copy below headline |
| `image_url` | text | Yes | Hero image URL |
| `image_alt` | text | Yes | Alt text for hero image |
| `primary_cta_label` | text | Yes | Primary button text (e.g., "Belanja Sekarang") |
| `primary_cta_url` | text | Yes | Primary button link |
| `secondary_cta_label` | text | No | Secondary button text (e.g., "Lihat Promo") |
| `secondary_cta_url` | text | No | Secondary button link |
| `starts_at` | timestamp | No | Publish window start |
| `ends_at` | timestamp | No | Publish window end |
| `sort_order` | integer | Yes | Display order |
| `is_active` | boolean | Yes | Toggle visibility |

### Business Rules
- Only one hero displays at a time (first active, sorted by `sort_order`).
- Publish window: `starts_at < ends_at` when both provided.
- If both dates are null, hero shows indefinitely.
- Inactive heroes are hidden from public API.

---

## 2. Promo Banners

**Admin route:** `/admin/promo`
**API:** `GET/POST /api/admin/promo-banners`, `PATCH/DELETE /api/admin/promo-banners/:id`

### Editable Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | text | Yes | Banner headline |
| `subtitle` | text | No | Supporting text |
| `badge_text` | text | No | Badge label (e.g., "Diskon 20%") |
| `image_url` | text | Yes | Banner image URL |
| `background_variant` | text | No | Color variant for background |
| `cta_label` | text | No | Call-to-action button text |
| `cta_url` | text | No | Call-to-action link |
| `placement` | text | Yes | Where banner appears (homepage, category, etc.) |
| `sort_order` | integer | Yes | Display order within placement |
| `starts_at` | timestamp | No | Publish window start |
| `ends_at` | timestamp | No | Publish window end |
| `is_active` | boolean | Yes | Toggle visibility |

### Business Rules
- Homepage displays up to 3 active promo banners.
- Banners respect publish window (only show within `starts_at`–`ends_at`).
- Placement controls where banner appears (homepage grid, category page, etc.).
- Sort order determines position within placement group.

---

## 3. Categories

**Admin route:** `/admin/kategori`
**API:** `GET/POST /api/admin/categories`, `PATCH/DELETE /api/admin/categories/:id`

### Editable Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | text | Yes | Category display name (2–80 chars) |
| `slug` | text | Yes | URL slug (lowercase kebab-case, unique) |
| `description` | text | No | Category description |
| `image_url` | text | No | Category display image |
| `icon_key` | text | No | Icon identifier for category rail |
| `sort_order` | integer | Yes | Display order |
| `is_active` | boolean | Yes | Toggle visibility |

### Business Rules
- Slug is auto-generated from name, editable.
- Only active categories appear in public queries and category rail.
- Sort order controls position in category rail and product listing filters.
- Deleting a category does NOT delete its products (products become uncategorized).

---

## 4. Products

**Admin route:** `/admin/produk/*`
**API:** `GET/POST /api/admin/products`, `PATCH/DELETE /api/admin/products/:id`

### Editable Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sku` | text | Yes | Unique identifier (2–50 chars, uppercase) |
| `name` | text | Yes | Product name (2–120 chars) |
| `slug` | text | Yes | URL slug (lowercase kebab-case, unique) |
| `category_id` | text | Yes | FK to categories table |
| `short_description` | text | No | Brief description (max 500 chars) |
| `description` | text | No | Full description (max 2,000 chars) |
| `price` | integer | Yes | Price in IDR (>= 0) |
| `compare_at_price` | integer | No | Original price for strike-through (> price) |
| `weight_value` | integer | No | Pack weight value |
| `weight_unit` | text | No | Weight unit (default "g") |
| `pieces_min` | integer | No | Minimum pieces per pack |
| `pieces_max` | integer | No | Maximum pieces per pack |
| `current_stock` | integer | Yes | Available stock (0–10,000,000) |
| `is_active` | boolean | Yes | Toggle visibility |
| `is_featured` | boolean | No | Featured flag |
| `is_best_seller` | boolean | No | Best seller flag |
| `is_new` | boolean | No | New product flag |
| `is_promo` | boolean | No | Promo flag |
| `cooking_instructions` | text | No | Cooking guide for this product |
| `storage_instructions` | text | No | Storage guide for this product |
| `seo_title` | text | No | SEO meta title |
| `seo_description` | text | No | SEO meta description |

### Business Rules
- SKU uniqueness enforced at application + DB level.
- Price and name are snapshotted on order items.
- Soft delete preserves order history.
- Media managed separately via Media Manager (see section 5).

---

## 5. Product Media Manager

**Admin route:** `/admin/produk/[id]/edit` (integrated in product form)
**API:** `POST/PATCH/DELETE /api/admin/products/:id/media`, `PUT /api/admin/products/:id/media/reorder`

### Editable Fields per Media Item

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `alt_text` | text | Yes | Alt text for accessibility/SEO |
| `title` | text | No | Display title |
| `is_primary` | boolean | Yes | Whether this is the primary media item |
| `sort_order` | integer | Yes | Display order in gallery |

### Operations

| Operation | Description |
|-----------|-------------|
| **Upload** | Multi-file image upload (max 5MB each). Single/multi video upload (max 50MB each). |
| **Reorder** | Drag-and-drop to change `sort_order`. Transactional. |
| **Set Primary** | Click star/checkbox to set `is_primary`. Exactly one primary per product. Primary must be image. |
| **Edit Metadata** | Inline edit of `alt_text` and `title`. |
| **Delete** | With confirmation dialog. Removes DB row + schedules physical file cleanup. |
| **Preview** | Image/video preview before save. |

### Business Rules
- Exactly one primary media item per product (enforced in service).
- Primary must be an image (not video) in P0.
- Max 12 items per product (recommended: 1 video + 4–8 images).
- Invalid files rejected before persistence (MIME check, size limit).
- Deleting media does not break other product data.

---

## 6. Testimonials

**Admin route:** `/admin/testimonial`
**API:** `GET/POST /api/admin/testimonials`, `PATCH/DELETE /api/admin/testimonials/:id`

### Editable Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customer_name` | text | Yes | Customer display name |
| `customer_title` | text | No | Customer title/role (e.g., "Reseller Jakarta") |
| `quote` | text | Yes | Testimonial text |
| `rating` | integer | No | Rating 1–5 (displayed as stars) |
| `avatar_url` | text | No | Customer avatar image |
| `sort_order` | integer | Yes | Display order |
| `is_published` | boolean | Yes | Toggle visibility |

### Business Rules
- Only published testimonials appear in public queries.
- Sort order controls display position in testimonial panel.
- Testimonials are soft-deleted (retain history).

---

## 7. Trust Items

**Admin route:** `/admin/trust`
**API:** `GET/POST /api/admin/trust-items`, `PATCH/DELETE /api/admin/trust-items/:id`

### Editable Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `icon_key` | text | Yes | Icon identifier (maps to lucide-react icon) |
| `title` | text | Yes | Trust item headline (e.g., "Kualitas Premium") |
| `description` | text | No | Supporting text |
| `sort_order` | integer | Yes | Display order |
| `is_active` | boolean | Yes | Toggle visibility |

### Business Rules
- Default trust items (from CONTENT_SEED.md):
  1. Kualitas Premium — Bahan pilihan terbaik.
  2. Rantai Dingin Terjaga — Kesegaran sampai tujuan.
  3. Kemasan Food Grade — Higienis dan berkualitas.
  4. Pengiriman Cepat — Area pengiriman sesuai konfigurasi.
- Only active items appear in trust strip on homepage.

---

## 8. Cooking Steps

**Admin route:** `/admin/cara-memasak`
**API:** `GET/POST /api/admin/cooking-steps`, `PATCH/DELETE /api/admin/cooking-steps/:id`

### Editable Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `step_number` | integer | Yes | Step sequence (1, 2, 3, ...) |
| `title` | text | Yes | Step title (e.g., "Keluarkan dari freezer") |
| `description` | text | No | Step details |
| `image_url` | text | No | Step illustration image |
| `sort_order` | integer | Yes | Display order |
| `is_active` | boolean | Yes | Toggle visibility |

### Business Rules
- Default cooking steps (from CONTENT_SEED.md):
  1. Keluarkan dari freezer — Ambil produk secukupnya.
  2. Masak sesuai petunjuk — Goreng, panggang, atau air fryer.
  3. Sajikan dan nikmati — Hidangkan selagi hangat.
- Steps display on homepage (cooking guide section) and on product detail pages.

---

## 9. Site Settings

**Admin route:** `/admin/pengaturan`
**API:** `GET/PATCH /api/admin/site-settings`

### Editable Fields (Singleton)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `brand_name` | text | Yes | Brand display name (e.g., "Jasmine Frozen Food") |
| `tagline` | text | No | Brand tagline |
| `logo_url` | text | No | Logo image URL |
| `whatsapp_number` | text | No | WhatsApp contact number |
| `email` | text | No | Contact email |
| `address` | text | No | Business address |
| `operating_hours` | text | No | Operating hours display text |
| `free_shipping_threshold` | integer | No | Free shipping minimum order (IDR) |
| `instagram_url` | text | No | Instagram profile URL |
| `tiktok_url` | text | No | TikTok profile URL |
| `youtube_url` | text | No | YouTube channel URL |
| `facebook_url` | text | No | Facebook page URL |

### Business Rules
- Singleton row (`id='default'`). Only one row exists.
- PATCH updates only provided fields (partial update).
- Settings are cached with revalidation (60–300s).
- Settings drive: footer content, WhatsApp button, marketplace links, free shipping threshold.

---

## 10. Marketplace Links

**Admin route:** `/admin/marketplace`
**API:** `GET/POST /api/admin/marketplace-links`, `PATCH/DELETE /api/admin/marketplace-links/:id`

### Editable Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `marketplace` | text | Yes | Marketplace name (e.g., "Tokopedia") |
| `label` | text | Yes | Display label (e.g., "Beli di Tokopedia") |
| `url` | text | Yes | Link URL |
| `logo_url` | text | No | Marketplace logo image |
| `sort_order` | integer | Yes | Display order |
| `is_active` | boolean | Yes | Toggle visibility |

### Business Rules
- Marketplace links appear in the marketplace panel on homepage and footer.
- Only active links appear in public queries.
- Sort order controls display position.

---

## 11. Newsletter Subscribers

**Admin route:** (no dedicated admin UI in P0)
**API:** `POST /api/newsletter` (public), subscriber list viewable in admin dashboard

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `email` | text | Subscriber email (unique) |
| `status` | text | `active` / `unsubscribed` |
| `source` | text | Where they subscribed (homepage, footer, etc.) |
| `subscribed_at` | timestamp | When they subscribed |
| `unsubscribed_at` | timestamp | When they unsubscribed (if applicable) |

### Business Rules
- Idempotent: subscribing the same email again does not create duplicate.
- `POST /api/newsletter` returns success even for existing email (no error leak).
- Unsubscribe flow is P1 (not P0).

---

## 12. Footer Content

**No separate CRUD** — footer is derived from site_settings + marketplace_links.

### Footer Sections

| Section | Data Source |
|---------|-------------|
| Brand info | site_settings (brand_name, tagline, logo_url) |
| Contact | site_settings (whatsapp_number, email, address, operating_hours) |
| Social links | site_settings (instagram, tiktok, youtube, facebook URLs) |
| Marketplace links | marketplace_links (active, sorted) |
| Newsletter | NewsletterForm component (POST /api/newsletter) |
| Navigation | Static links (Home, Products, Categories, Promo, etc.) |

---

## 13. SEO Content

### Per-Product SEO
- `seo_title`: Custom meta title (falls back to product name).
- `seo_description`: Custom meta description (falls back to short_description).

### Global SEO
- Organization JSON-LD from site_settings (brand_name, logo_url, contact, social).
- Product JSON-LD with image array from product_media.
- Canonical URLs on all pages.
- OpenGraph tags with primary product image.

### Sitemap
- Auto-generated from active products, categories, and static pages.
- Updated on content changes via cache invalidation.

---

## 14. Content Dependency Matrix

| Homepage Section | Primary Data Source | Fallback |
|------------------|--------------------:|----------|
| Hero | hero_campaigns | None (section hidden) |
| Category Rail | categories | None (section hidden) |
| Promo Banners | promo_banners | None (section hidden) |
| Product Carousel | products (best_seller/featured) | None (section hidden) |
| Trust Strip | trust_items | Hardcoded defaults from CONTENT_SEED.md |
| Cooking Guide | cooking_steps | Hardcoded defaults from CONTENT_SEED.md |
| Testimonials | testimonials | None (section hidden) |
| Marketplace | marketplace_links | None (section hidden) |
| Footer | site_settings + marketplace_links | Minimal footer with brand name |
| Newsletter | newsletter_subscribers | None (form hidden) |

---

*This spec defines the admin's editing power. All changes are data-driven and require no code deploy.*
