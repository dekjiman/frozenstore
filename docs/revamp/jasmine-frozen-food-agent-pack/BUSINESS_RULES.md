# Business Rules — Jasmine Frozen Food

> All business constraints enforced by the application. Agents must not violate
> these rules. Any change to these rules requires explicit stakeholder approval.

---

## 1. Product Rules

### 1.1 Product Identity
- **SKU:** Uppercase, 2–50 chars, pattern `^[A-Z0-9][A-Z0-9._-]{1,49}$`. Unique (case-insensitive check + DB unique constraint).
- **Name:** 2–120 chars, trimmed.
- **Slug:** Lowercase kebab-case, unique. Auto-generated from name. Editable by admin.
- **Category:** Linked via `category_id` FK to `categories` table. Legacy `category` text field retained during transition.

### 1.2 Pricing
- All prices stored as **integer rupiah** (no decimals).
- `price` >= 0, required.
- `compare_at_price`: nullable. When present, must be > `price`. Displayed as struck-through.
- Prices are **read-time** for cart display but **snapshotted** at order creation.

### 1.3 Stock
- `current_stock`: integer, 0–10,000,000, non-negative.
- Stock **never goes negative**. Deduction refuses if `available < quantity`.
- Stock is updated atomically within a transaction alongside order creation.
- Optimistic locking via compare-and-swap (CAS) on `current_stock` value.

### 1.4 Merchandising Flags
- `is_featured`: Boolean. Products marked featured appear in featured sections.
- `is_best_seller`: Boolean. Products marked best seller appear in best-seller carousel.
- `is_new`: Boolean. New product badge.
- `is_promo`: Boolean. Promo badge display.
- Flags are admin-toggleable. No automatic flag promotion.

### 1.5 Rating & Sales
- `rating_average`: Integer stored as x100 (e.g., 490 = 4.90 stars). Range 0–500.
- `rating_count`: Integer >= 0. Number of ratings.
- `sold_count`: Integer >= 0. Incremented on successful order (not on cart add).
- These are **display-only** in P0. No review submission system.

### 1.6 Badges
- Stored in `product_badges` table. Each badge has `label`, `badge_type`, `sort_order`.
- Badge examples: "Halal", "BPOM", "Best Seller", "Promo", "Baru".
- **Certification claims** (Halal, BPOM) must only be published when verified by owner. Do not invent certification claims in seed data.

### 1.7 Product Content
- `short_description`: Max 500 chars. Displayed on product cards and detail summary.
- `description`: Max 2,000 chars. Full product description.
- `cooking_instructions`: Text. Cooking guide for this product.
- `storage_instructions`: Text. Storage guide for this product.
- `weight_value` + `weight_unit`: Pack weight (e.g., 500g, 1kg).
- `pieces_min` + `pieces_max`: Pack quantity range (e.g., 10–12 pcs).

### 1.8 Soft Delete
- Products are soft-deleted via `deleted_at` timestamp.
- Soft-deleted products are excluded from all public queries.
- Admin can optionally view soft-deleted products (`?includeDeleted=true`).
- Soft delete is used where history/reference matters (orders reference products).

---

## 2. Category Rules

### 2.1 Category Identity
- `name`: Required, 2–80 chars. Displayed to customers.
- `slug`: Lowercase kebab-case, unique. Auto-generated from name.
- `description`: Optional text.
- `image_url`: Optional. Category display image.
- `icon_key`: Optional. Icon identifier for category rail.

### 2.2 Ordering & Visibility
- `sort_order`: Integer >= 0. Controls display order in category rail and admin.
- `is_active`: Boolean. Only active categories appear in public queries.
- Inactive categories are hidden from storefront but visible in admin.

### 2.3 Migration from Legacy
- Legacy `products.category` text field is preserved during transition.
- Categories are backfilled from unique `products.category` values.
- `products.category_id` is nullable initially; made required after backfill verification.
- Legacy column removed only after production verification.

---

## 3. Stock Rules

### 3.1 Stock States
- `current_stock` represents available units for sale.
- Stock is non-negative at all times (DB constraint + application check).

### 3.2 Deduction Rules
- Stock is deducted **only at checkout**, not at cart add.
- Deduction is **atomic** with order creation (single transaction).
- Deduction is **idempotent** per order number (prevents double-deduction on retries).
- If a `stockMovements` record of type `"out"` exists for the same `productId` + `orderNumber`, deduction is skipped.

### 3.3 Concurrency
- Optimistic locking via CAS: `UPDATE products SET current_stock = ? WHERE id = ? AND current_stock = ?`
- If `changes !== 1`, another transaction modified stock → retry or fail with `STOCK_UNAVAILABLE`.
- This prevents overselling under concurrent checkouts.

### 3.4 Stock Movements
- Every stock change creates a `stock_movements` record.
- Fields: `product_id`, `type` (in/out/adjustment), `quantity`, `stock_before`, `stock_after`, `reason`, `reference`, `created_by`.
- Stock movements are **immutable** (no update/delete API).

### 3.5 Manual Stock Management
- Admin can create stock movements of type `"in"` or `"adjustment"`.
- Admin can directly update `current_stock` via `PATCH /api/admin/products/:id/stock`.
- All manual changes create a stock movement record with reason.

---

## 4. Cart Rules

### 4.1 Cart Identification
- Cart is identified by a **session key** from a signed cookie (`raf_cart_session`).
- Cookie is HMAC-SHA256 signed. 30-day TTL.
- A new cart is created automatically on first access.

### 4.2 Cart Items
- One row per product per cart (unique constraint on `cart_id, product_id`).
- `quantity` >= 1. Cannot add zero or negative quantities.
- Adding an existing product increments quantity (does not create duplicate rows).

### 4.3 Cart Display
- `lineTotal` = `product.price × item.quantity` (uses **current** product price at read time).
- `itemCount` = sum of all item quantities (not number of line items).
- `subtotal` = sum of all line totals.
- Orphaned cart items (deleted product) are silently excluded from payload.

### 4.4 Guest vs Authenticated
- Guest carts are identified by session key only.
- Authenticated carts are linked to user ID.
- Cart persistence: 30-day cookie for guests, session-based for authenticated.

### 4.5 Cart Expiration
- Cart items are **deleted** after successful checkout (cart is emptied).
- No automatic expiration for abandoned carts in P0.

---

## 5. Checkout Rules

### 5.1 Pre-Checkout Validation
- Valid (non-new) cart session required.
- Cart must not be empty (409 if empty).
- Each product must exist, be active, and not be soft-deleted.
- Available stock >= requested quantity for each product.

### 5.2 Shipping
- **Flat-rate shipping:** Configurable via `site_settings.free_shipping_threshold`.
- Default: IDR 20,000 (hardcoded until site_settings is connected).
- `totalAmount = subtotalAmount + shippingAmount`.

### 5.3 Shipping Form Validation

| Field | Rule | Error |
|-------|------|-------|
| `recipientName` | Min 3 chars | `Nama penerima minimal 3 karakter` |
| `phone` | Pattern `^(?:\+62\|62\|0)8\d{8,12}$` | `Nomor WhatsApp tidak valid` |
| `address` | Min 15 chars | `Alamat minimal 15 karakter` |
| `city` | Min 3 chars | `Kota wajib diisi` |
| `province` | Min 3 chars | `Provinsi wajib diisi` |
| `postalCode` | Exactly 5 digits | `Kode pos harus 5 digit` |
| `notes` | Max 250 chars | `Catatan maksimal 250 karakter` |

- Phone: spaces and hyphens stripped before validation.

### 5.4 Order Creation
- Order number format: `JAS-YYYYMMDD-XXXX` (changed from `RAF-`).
- Initial state: `paymentStatus: "pending"`, `orderStatus: "waiting_payment"`.
- Order items include **snapshotted** product name, SKU, and price.
- Guest orders: `userId: null`, `customerId: "guest:{sessionKey}"`.
- Authenticated orders: `userId` and `customerId` set to user ID.

### 5.5 Transaction Atomicity
- Order creation, order items, stock deduction, and cart clearing run in a **single database transaction**.
- If any step fails, all changes are rolled back.

---

## 6. Order Rules

### 6.1 Order Number
- Format: `JAS-YYYYMMDD-XXXX` (prefix-date-sequence).
- Sequence: random 4-digit suffix (0–9999), zero-padded.
- Max ~10,000 orders per day before suffix exhaustion (acceptable for this scale).

### 6.2 Payment Status Lifecycle

```
pending → awaiting_verification → paid
                                   ↓
                               failed
```

- `pending`: Initial state after order creation.
- `awaiting_verification`: Set when customer uploads payment proof.
- `paid`: Set by admin after verifying payment.
- `failed`: Set by admin if payment verification fails.

### 6.3 Order Status Lifecycle

```
waiting_payment → processing → shipped → delivered
                       ↑              ↓
                       └────────── cancelled
```

- `waiting_payment`: Initial state.
- `processing`: Auto-set when `paymentStatus` changes to `"paid"` (if `orderStatus` not explicitly provided).
- `shipped`: Set by admin when order is shipped.
- `delivered`: Set by admin when order is delivered.
- `cancelled`: Set by admin or customer (if allowed).

### 6.4 Payment Proof
- File saved to `public/uploads/payment-proofs/`.
- Supported formats: JPG, PNG, WebP. Max 5MB.
- On upload, `paymentStatus` changes to `awaiting_verification`.
- Admin can view the proof image in order management.

### 6.5 Order Items
- Each order item includes **snapshotted** data: `product_name`, `product_sku`, `price_at_purchase`.
- This ensures order history is accurate even if product is later modified or deleted.

---

## 7. Auth Rules

### 7.1 Session Management
- Cookie-based sessions: `raf_auth_session`.
- Token: 32 random bytes → base64url (44 chars).
- Stored as **SHA-256 hash** in `auth_sessions` table (raw token never stored).
- 7-day expiry.
- Cookie attributes: `httpOnly: true`, `sameSite: "lax"`, `secure: true` (production), `path: "/"`.

### 7.2 Password Hashing
- Node.js `scrypt` (64-byte key, 16-byte salt).
- Format: `scrypt$${salt}$${keyHex}`.
- Timing-safe comparison on verification.

### 7.3 User Roles
- `customer`: Default. Browse, cart, checkout, profile, order history.
- `admin`: Full admin dashboard + admin API access.
- Role stored in `users.role` with CHECK constraint.

### 7.4 Admin Authorization
- Dual-path check:
  1. Session cookie with `role === "admin"` → grant access.
  2. `Authorization: Bearer <key>` matching `ADMIN_API_KEY` env → grant access.
- Dev fallback: hardcoded key `raf-store-admin-development-key` when `NODE_ENV !== "production"` AND `ADMIN_API_KEY` not set.
- If neither path succeeds: 503 (misconfiguration) or 401 (unauthorized).

### 7.5 Registration Validation

| Field | Rule |
|-------|------|
| name | 3–100 chars |
| email | Valid format, unique |
| phone | Indonesian format `+62/62/0` prefix, unique |
| password | Min 8 chars, uppercase, digit, symbol |

---

## 8. Promo Rules

### 8.1 Visual Promo (P0)
- Promo is **visual display only** in P0. No checkout coupon engine.
- `is_promo` flag on products enables promo badge display.
- `compare_at_price` shows struck-through original price.
- Promo banners display on homepage with CTA links.

### 8.2 Promo Banners
- Each banner has: `title`, `subtitle`, `badge_text`, `image_url`, `background_variant`, `cta_label`, `cta_url`.
- `placement`: Where the banner appears (homepage, category page, etc.).
- `sort_order`: Display order.
- `starts_at` / `ends_at`: Publish window. Banner only shows within this window.
- `is_active`: Manual toggle. Inactive banners are hidden.

### 8.3 Promo Consistency
- Promo display does **not** silently alter checkout totals.
- Price shown to customer = `price` (or `compare_at_price` as reference only).
- Checkout charges the `price` field. No automatic discount application.

### 8.4 Future: Coupon Engine (P1)
- Basic coupon/promotion rules are P1 (not P0).
- When implemented, coupons must be validated server-side at checkout.
- Coupon discount must be snapshot on order item.

---

## 9. Best Seller Rules

### 9.1 Flag
- `is_best_seller`: Boolean, admin-toggleable.
- No automatic promotion based on sold_count in P0.

### 9.2 Display
- Best sellers appear in the homepage `ProductSection` carousel.
- Sort: by `sold_count` descending within best-seller flagged products.
- Fallback: if no best sellers, show featured products.

### 9.3 Sold Count
- `sold_count`: Incremented on **successful order creation** (not on cart add).
- Increment is atomic: `UPDATE products SET sold_count = sold_count + ? WHERE id = ?`.
- Used for display and sorting, not for business decisions.

---

## 10. Media Rules

### 10.1 Media Collection
- Each product has an ordered media collection (images + videos).
- Stored in `product_media` table. Binary files in storage adapter, never DB blobs.

### 10.2 Primary Media
- Exactly **one** primary media item per product.
- Primary media **must be an image** in P0 (ensures catalog cards and SEO thumbnails are reliable).
- Primary image is used for: product cards, OpenGraph, JSON-LD, catalog listings.

### 10.3 Media Limits
- Maximum recommended: 12 items per product.
- P0 recommendation: 1 video max + 4–8 images.
- Image max: 5MB each. Formats: JPEG, PNG, WebP, AVIF.
- Video max: 50MB each. Format: MP4/H.264 only.

### 10.4 Media Ordering
- `sort_order`: Integer. Controls display order in gallery.
- Reordering is transactional.
- Admin can drag-and-drop reorder.

### 10.5 Video Rules
- Video does **not** autoplay with sound.
- Autoplay muted allowed only after explicit user interaction.
- `preload="metadata"` only (no full preloading).
- Poster image required for published videos.
- Video pauses when user switches to another media item.
- Video is **not loaded** in catalog/homepage cards (only primary image).

### 10.6 Alt Text
- Every published image requires meaningful alt text.
- Admin-editable. Fallback to product name if not provided.
- Alt text is required for accessibility and SEO.

### 10.7 Delete Strategy
- DB row is deleted first.
- Physical file cleanup runs after successful DB mutation.
- Retry/cleanup for storage failures.
- Deleting media does not break other product data.

---

## 11. Shipping Rules

### 11.1 Shipping Cost
- **Flat-rate** shipping.
- Configurable via `site_settings.free_shipping_threshold`.
- Default: IDR 20,000 (hardcoded until site_settings connected).
- Free shipping threshold: when cart subtotal >= threshold, shipping = 0.

### 11.2 Shipping Address
- Required fields: recipient name, phone, address, city, province, postal code.
- Optional: shipping notes (max 250 chars).
- Phone must be Indonesian mobile format.

### 11.3 Frozen Shipping
- Products are frozen food. Shipping must maintain cold chain.
- Trust item: "Rantai Dingin Terjaga — Kesegaran sampai tujuan."
- Informasi Pengiriman Frozen section on product detail.

---

## 12. Content Rules

### 12.1 Publish Windows
- Hero campaigns and promo banners support `starts_at` / `ends_at` publish windows.
- Content only shows publicly when `starts_at <= now <= ends_at`.
- If `starts_at` and `ends_at` are null, content shows indefinitely.
- `starts_at` must be < `ends_at` when both are provided.

### 12.2 Soft Delete
- Content with historical reference uses soft delete.
- Hero campaigns, promo banners: soft delete (retain history).
- Testimonials: soft delete (retain for order references).
- Trust items, cooking steps: hard delete (no history needed).

### 12.3 Sort Order
- All content types with `sort_order` use integer ordering.
- Sort order is unique within its context (e.g., categories, trust items).
- Admin can reorder via drag-and-drop or numeric input.

### 12.4 Active/Published State
- All content types have `is_active` or `is_published` toggle.
- Only active/published content appears in public queries.
- Inactive content is visible in admin for editing.

---

## 13. Validation Rules Summary

### 13.1 Product Validation

| Field | Rule | Error |
|-------|------|-------|
| SKU | `^[A-Z0-9][A-Z0-9._-]{1,49}$`, unique | SKU harus 2-50 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung |
| Name | 2–120 chars | Nama produk harus 2-120 karakter |
| Category | 2–80 chars | Kategori harus 2-80 karakter |
| Description | Max 2,000 chars | Deskripsi maksimal 2.000 karakter |
| Price | Integer >= 0 | Harga harus bilangan bulat non-negatif |
| Stock | Integer, 0–10,000,000 | Stok harus bilangan bulat antara 0 dan 10.000.000 |
| Image URL | Required, max 2,048 chars, starts with `/` or `http(s)://` | URL gambar produk tidak valid |

### 13.2 Shipping Validation

| Field | Rule | Error |
|-------|------|-------|
| Recipient name | Min 3 chars | Nama penerima minimal 3 karakter |
| Phone | `^(?:\+62\|62\|0)8\d{8,12}$` | Nomor WhatsApp tidak valid |
| Address | Min 15 chars | Alamat minimal 15 karakter |
| City | Min 3 chars | Kota wajib diisi |
| Province | Min 3 chars | Provinsi wajib diisi |
| Postal code | Exactly 5 digits | Kode pos harus 5 digit |
| Notes | Max 250 chars | Catatan maksimal 250 karakter |

### 13.3 Search Validation

| Field | Rule | Error |
|-------|------|-------|
| Query `q` | Max 100 chars | Kata kunci maksimal 100 karakter |

---

## 14. Hardcoded Values

| Constant | Value | Location | Notes |
|----------|-------|----------|-------|
| Shipping cost | 20,000 IDR | `checkout/shipping/route.ts` | Configurable via site_settings |
| Session duration | 7 days (604,800s) | `auth-session.ts` | |
| Session cookie | `raf_auth_session` | `auth-session.ts` | Not renamed during revamp |
| Cart cookie | `raf_cart_session` | `cart-session.ts` | Not renamed during revamp |
| Cart TTL | 30 days | `cart-session.ts` | |
| Order prefix | `JAS-` | `order-number.ts` | Changed from `RAF-` |
| Dev admin key | `raf-store-admin-development-key` | `admin-auth.ts` | Non-production only |
| Max search length | 100 chars | `products/route.ts` | |
| Max product name | 120 chars | `admin-product.ts` | |
| Max description | 2,000 chars | `admin-product.ts` | |
| Max SKU length | 50 chars | `admin-product.ts` | |
| Max stock | 10,000,000 | `admin-product.ts` | |
| Max image URL | 2,048 chars | `admin-product.ts` | |
| Image max size | 5 MB | Product media spec | |
| Video max size | 50 MB | Product media spec | |
| Max media per product | 12 | Product media spec | |
| Max video per product | 1 | Product media spec P0 | |
| Hash algorithm | SHA-256 | `auth-session.ts` | |
| Token entropy | 32 bytes (256 bits) | `auth-session.ts` | |

---

## 15. Non-Goals (Explicitly Out of Scope)

| Feature | Status | Phase |
|---------|--------|-------|
| Marketplace multi-vendor | Not in scope | — |
| Payment gateway automation | Not in scope | — |
| Loyalty points | Not in scope | — |
| Multi-warehouse | Not in scope | — |
| Native mobile app | Not in scope | — |
| Coupon engine | P1 (not P0) | Future |
| Wishlist | P1 | Future |
| Reseller pricing | P1 | Future |
| Richer analytics | P1 | Future |
| Newsletter integration | P1 | Future |
| PostgreSQL adapter | P1 | Future |

---

*These rules are authoritative. Any implementation must enforce them. Changes require explicit approval.*
