# Database Schema Change Plan

## Existing tables retained
`products`, `carts`, `cart_items`, `users`, `stock_movements`, and all existing order/payment/auth tables in the repository remain authoritative. Apply additive migrations first.

## Product changes
Add to `products`:
- `slug text unique`
- `short_description text default ''`
- `compare_at_price integer nullable`
- `weight_value integer nullable`
- `weight_unit text default 'g'`
- `pieces_min integer nullable`
- `pieces_max integer nullable`
- `is_featured boolean default false`
- `is_best_seller boolean default false`
- `is_new boolean default false`
- `is_promo boolean default false`
- `rating_average integer default 0` (store x100, e.g. 490)
- `rating_count integer default 0`
- `sold_count integer default 0`
- `cooking_instructions text default ''`
- `storage_instructions text default ''`
- `seo_title text nullable`
- `seo_description text nullable`

Keep legacy `category` temporarily during migration, then introduce `category_id`.

## New tables
### categories
`id, name, slug, description, image_url, icon_key, sort_order, is_active, created_at, updated_at`

### product_media
Replaces the originally proposed `product_images` table so image and video share one ordered collection.

Columns:
`id, product_id, media_type, url, storage_key, thumbnail_url, poster_url, alt_text, title, sort_order, is_primary, duration_seconds, width, height, mime_type, file_size_bytes, created_at, updated_at`

Rules:
- `media_type` enum/check: `image | video`.
- Exactly one primary item per product; P0 primary must be image.
- `poster_url` required for published video.
- `duration_seconds` only for video.
- Index `(product_id, sort_order)`.
- Do not store binary content in the database.
- If the repository already has a product image field/table, backfill it into `product_media` as primary image and retain legacy read compatibility for one release.

### product_badges
`id, product_id, label, badge_type, sort_order`

### hero_campaigns
`id, eyebrow, title, highlighted_text, description, image_url, image_alt, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url, starts_at, ends_at, sort_order, is_active, created_at, updated_at`

### promo_banners
`id, title, subtitle, badge_text, image_url, background_variant, cta_label, cta_url, placement, sort_order, starts_at, ends_at, is_active`

### trust_items
`id, icon_key, title, description, sort_order, is_active`

### cooking_steps
`id, step_number, title, description, image_url, sort_order, is_active`

### testimonials
`id, customer_name, customer_title, quote, rating, avatar_url, sort_order, is_published, created_at`

### site_settings
Key-value or typed singleton. Recommended typed singleton columns:
`id='default', brand_name, tagline, logo_url, whatsapp_number, email, address, operating_hours, free_shipping_threshold, instagram_url, tiktok_url, youtube_url, facebook_url, updated_at`

### marketplace_links
`id, marketplace, label, url, logo_url, sort_order, is_active`

### newsletter_subscribers
`id, email unique, status, source, subscribed_at, unsubscribed_at`

## Constraints/indexes
- Non-negative prices/stocks/counts.
- Unique category/product slugs.
- Index active + sort order for homepage tables.
- Index products by active/category/featured/best seller/name.
- One primary product media item per product enforced in service if DB partial index portability is difficult; P0 requires it to be an image.
- Validate non-negative file size, dimensions and duration.
- Cascade media rows on product deletion only if this matches existing delete policy; physical file cleanup remains a service responsibility.

## Migration compatibility
1. Add categories.
2. Backfill unique category rows from legacy `products.category`.
3. Add nullable `category_id`, backfill, then make required when safe.
4. Preserve legacy category column for one release; remove only after verification.
