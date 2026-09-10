# Current State Audit — Raf Store (Pre-Revamp Baseline)

> Generated as Phase 0 deliverable. This document maps the complete existing codebase
> before the Jasmine Frozen Food revamp begins. Every subsequent phase must reference
> this baseline for regression tracking.

---

## 1. Executive Summary

| Attribute | Value |
|-----------|-------|
| Brand name | Raf Store |
| Framework | Next.js 16.2 (App Router) |
| React | 19.2 |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS 4 |
| ORM | Drizzle ORM 0.45 |
| Database | SQLite (better-sqlite3), WAL mode, FK on |
| DB path | `data/raf-store.db` |
| Migrations | 11 (0000–0010) |
| Auth | Custom cookie-based sessions, scrypt hashing |
| UI locale | Indonesian (`lang="id"`) |
| Icons | lucide-react |
| Hosting model | Monolithic full-stack Next.js |

---

## 2. Routes Map

### 2.1 Customer-Facing Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Homepage — hero section + product catalog with search |
| `/produk/[id]` | `app/produk/[id]/page.tsx` | Product detail — image, description, price, add-to-cart |
| `/keranjang` | `app/keranjang/page.tsx` | Cart — item list, quantities, subtotal, proceed to checkout |
| `/checkout` | `app/checkout/page.tsx` | Multi-step checkout — shipping, payment selection, proof upload, summary |
| `/daftar` | `app/daftar/page.tsx` | Customer registration |
| `/masuk` | `app/masuk/page.tsx` | Customer/admin login |
| `/akun` | `app/akun/page.tsx` | Account profile view/edit |
| `/akun/pesanan` | `app/akun/pesanan/page.tsx` | Order history (paginated) |

**Missing for Jasmine:**
- `/produk` (dedicated product listing page — currently homepage serves both hero + catalog)
- `/kategori/[slug]` (category browse)
- `/promo` (promotions landing)
- `/cara-memasak` (cooking guide)
- `/reseller` (reseller info)

### 2.2 Admin Routes

| Route | File | Purpose |
|-------|------|---------|
| `/admin` | `app/admin/page.tsx` | Dashboard — stock summary, low-stock alerts |
| `/admin/produk` | `app/admin/produk/page.tsx` | Product list with search |
| `/admin/produk/baru` | `app/admin/produk/baru/page.tsx` | Create product form |
| `/admin/produk/[id]/edit` | `app/admin/produk/[id]/edit/page.tsx` | Edit product form |
| `/admin/produk/[id]/stok` | `app/admin/produk/[id]/stok/page.tsx` | Per-product stock management |
| `/admin/stok/masuk` | `app/admin/stok/masuk/page.tsx` | Manual stock inbound |
| `/admin/stok/riwayat` | `app/admin/stok/riwayat/page.tsx` | Stock movement history (filtered, paginated) |
| `/admin/pesanan` | `app/admin/pesanan/page.tsx` | Order management list |
| `/admin/pengaturan-pembayaran` | `app/admin/pengaturan-pembayaran/page.tsx` | Payment settings (bank accounts + transfer instructions) |

**Missing for Jasmine admin:**
- Hero campaign CRUD
- Promo banner CRUD
- Testimonial CRUD
- Trust badge CRUD
- Cooking step CRUD
- Site settings (brand, contact, social, marketplace)
- Product media manager (multi-image + video)

### 2.3 Root Layout

- `app/layout.tsx` — Wraps children in `AuthProvider` > `CartProvider`
- Fonts: Geist Sans + Geist Mono via `next/font/google`
- Metadata: `"Raf Store — Belanja Pilihan, Setiap Hari"`
- `app/globals.css` — Tailwind import, CSS variables (`--background: #fafaf9`, `--foreground: #1c1917`), toast animation

---

## 3. Component Inventory

### 3.1 Context Providers

| File | Purpose |
|------|---------|
| `components/auth-provider.tsx` | React Context for auth state (`useAuth`). Login/logout/session refresh via `/api/auth/*` |
| `components/cart-provider.tsx` | React Context for cart state (`useCart`). Add/update/remove items, toast notifications |

### 3.2 Customer-Facing Components

| File | Purpose |
|------|---------|
| `components/catalog-section.tsx` | Product grid display with product cards |
| `components/catalog-search.tsx` | Search input for filtering products |
| `components/empty-search-state.tsx` | "No results" state |
| `components/product-image.tsx` | Product image with fallback/loading |
| `components/product-detail.tsx` | Full product detail view |
| `components/cart-button.tsx` | Header cart icon with badge count |
| `components/cart-content.tsx` | Cart page content (item list, quantities, subtotal) |
| `components/checkout-flow.tsx` | Multi-step checkout wizard |
| `components/shipping-form.tsx` | Shipping address form |
| `components/payment-proof-upload.tsx` | File upload for payment proof image |
| `components/transfer-guide.tsx` | Bank account info + transfer instructions display |
| `components/order-summary.tsx` | Order confirmation / detail view |
| `components/login-form.tsx` | Login form |
| `components/register-form.tsx` | Registration form |
| `components/account-navigation.tsx` | Header account dropdown/icon |
| `components/account-page.tsx` | Profile page content |

### 3.3 Admin Components

| File | Purpose |
|------|---------|
| `components/admin-shell.tsx` | Admin layout shell (dark sidebar, nav, auth guard, logout). Links: Ringkasan, Produk & Stok, Riwayat Stok, Pesanan, Pembayaran |
| `components/admin-stock-dashboard.tsx` | Dashboard stats (total products, units, inventory value, low stock, out of stock) |
| `components/admin-products-page.tsx` | Admin product list with search |
| `components/admin-product-form.tsx` | Create product form |
| `components/admin-edit-product-form.tsx` | Edit product form |
| `components/admin-stock-in-form.tsx` | Manual stock inbound form |
| `components/admin-stock-history.tsx` | Stock movement history table with filters |
| `components/admin-orders-page.tsx` | Order management list |
| `components/admin-payment-settings.tsx` | Payment settings management |

### 3.4 Component Gaps for Jasmine

- **Storefront components needed:** `StoreHeader`, `HeroCampaign`, `CategoryRail`, `PromoBannerGrid`, `ProductCard` (refactored), `TrustStrip`, `CookingGuide`, `TestimonialPanel`, `MarketplacePanel`, `StoreFooter`, `NewsletterForm`
- **Admin components needed:** Hero CRUD, Promo CRUD, Testimonial CRUD, Trust/Cooking CRUD, Site Settings, Product Media Manager
- **Refactoring needed:** `catalog-section.tsx` is currently one oversized component handling the entire homepage catalog. Must be decomposed.

---

## 4. Database Schema

### 4.1 Existing Tables (9)

#### `products`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT | PK (UUID) |
| `sku` | TEXT | NOT NULL, UNIQUE, 2–50 chars |
| `name` | TEXT | NOT NULL |
| `category` | TEXT | NOT NULL (plain text, no FK) |
| `description` | TEXT | Default `""` |
| `price` | INTEGER | NOT NULL, >= 0 (IDR) |
| `current_stock` | INTEGER | NOT NULL, default 0, >= 0 |
| `image_url` | TEXT | NOT NULL (single URL/path) |
| `is_active` | INTEGER | Boolean, default true |
| `deleted_at` | INTEGER | Nullable (soft delete, timestamp ms) |
| `created_at` | INTEGER | Auto (timestamp ms) |
| `updated_at` | INTEGER | Auto-updates (timestamp ms) |

#### `carts`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT | PK (UUID) |
| `session_key` | TEXT | NOT NULL, UNIQUE |
| `created_at` / `updated_at` | INTEGER | Auto |

#### `cart_items`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT | PK (UUID) |
| `cart_id` | TEXT | FK → carts.id, CASCADE DELETE |
| `product_id` | TEXT | FK → products.id, CASCADE DELETE |
| `quantity` | INTEGER | NOT NULL, > 0 |
| `created_at` / `updated_at` | INTEGER | Auto |
| — | UNIQUE | `(cart_id, product_id)` |

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT | PK (UUID) |
| `role` | TEXT | `"customer"` or `"admin"` (CHECK) |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | NOT NULL, UNIQUE |
| `email_verified` | INTEGER | Boolean, default false |
| `image` | TEXT | Nullable (avatar URL) |
| `phone` | TEXT | UNIQUE, nullable |
| `password_hash` | TEXT | scrypt format |
| `created_at` / `updated_at` | INTEGER | Auto |

#### `auth_sessions`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT | PK (UUID) |
| `user_id` | TEXT | FK → users.id, CASCADE DELETE |
| `token_hash` | TEXT | NOT NULL, UNIQUE (SHA-256) |
| `expires_at` | INTEGER | 7-day lifetime |
| `created_at` | INTEGER | Auto |

#### `stock_movements`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT | PK (UUID) |
| `product_id` | TEXT | FK → products.id, RESTRICT DELETE |
| `type` | TEXT | `"in"`, `"out"`, or `"adjustment"` |
| `quantity` | INTEGER | NOT NULL, > 0 |
| `stock_before` | INTEGER | NOT NULL, >= 0 |
| `stock_after` | INTEGER | NOT NULL, >= 0 |
| `reason` | TEXT | NOT NULL, non-empty |
| `reference` | TEXT | Nullable (e.g. order number) |
| `created_by` | TEXT | FK → users.id, SET NULL on delete |
| `created_at` | INTEGER | Auto |

#### `orders`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT | PK (UUID) |
| `order_number` | TEXT | NOT NULL, UNIQUE, format `RAF-YYYYMMDD-XXXX` |
| `user_id` | TEXT | FK → users.id, nullable (guests) |
| `customer_id` | TEXT | NOT NULL (`userId` or `guest:{sessionKey}`) |
| `recipient_name` | TEXT | |
| `recipient_phone` | TEXT | |
| `shipping_address` | TEXT | |
| `shipping_city` | TEXT | |
| `shipping_province` | TEXT | |
| `shipping_postal_code` | TEXT | |
| `shipping_notes` | TEXT | Nullable |
| `subtotal_amount` | INTEGER | >= 0 |
| `shipping_amount` | INTEGER | >= 0 (fixed 20,000 IDR) |
| `total_amount` | INTEGER | >= 0 |
| `payment_proof_url` | TEXT | Path to uploaded image |
| `payment_status` | TEXT | `"pending"` / `"awaiting_verification"` / `"paid"` / `"failed"` |
| `order_status` | TEXT | `"waiting_payment"` / `"processing"` / `"shipped"` / `"delivered"` / `"cancelled"` |
| `created_at` / `updated_at` | INTEGER | Auto |

#### `order_items`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT | PK (UUID) |
| `order_id` | TEXT | FK → orders.id, CASCADE DELETE |
| `product_id` | TEXT | NOT NULL (snapshot reference) |
| `product_sku` | TEXT | Denormalized snapshot |
| `product_name` | TEXT | Denormalized snapshot |
| `quantity` | INTEGER | NOT NULL, > 0 |
| `price_at_purchase` | INTEGER | NOT NULL (price snapshot) |
| `created_at` | INTEGER | Auto |

#### `rekening_toko` (store bank accounts)
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT | PK (UUID) |
| `bank_name` | TEXT | NOT NULL |
| `account_number` | TEXT | NOT NULL, 5–30 digits |
| `account_holder_name` | TEXT | NOT NULL |
| `instruction` | TEXT | Nullable |
| `is_active` | INTEGER | Boolean, default true |
| `display_order` | INTEGER | >= 0 |
| `created_at` / `updated_at` | INTEGER | Auto |
| — | UNIQUE | `(bank_name, account_number)` |

#### `instruksi_transfer` (transfer instructions)
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT | PK (UUID) |
| `title` | TEXT | NOT NULL, 2–100 chars |
| `instruction` | TEXT | NOT NULL, 5–1000 chars |
| `step_order` | INTEGER | NOT NULL, UNIQUE, positive |
| `is_active` | INTEGER | Boolean, default true |
| `created_at` | INTEGER | Auto |

### 4.2 Schema Gaps for Jasmine

**New tables required (8):**
- `categories` — id, name, slug, description, image_url, icon_key, sort_order, is_active
- `product_media` — id, product_id, media_type (image|video), url, storage_key, thumbnail_url, poster_url, alt_text, title, sort_order, is_primary, duration_seconds, width, height, mime_type, file_size_bytes
- `product_badges` — id, product_id, label, badge_type, sort_order
- `hero_campaigns` — id, eyebrow, title, highlighted_text, description, image_url, CTAs, publish window, sort_order, is_active
- `promo_banners` — id, title, subtitle, badge_text, image_url, background_variant, CTAs, placement, sort_order, publish window, is_active
- `trust_items` — id, icon_key, title, description, sort_order, is_active
- `cooking_steps` — id, step_number, title, description, image_url, sort_order, is_active
- `testimonials` — id, customer_name, customer_title, quote, rating, avatar_url, sort_order, is_published
- `site_settings` — singleton with brand_name, tagline, logo_url, whatsapp, email, address, social URLs, free_shipping_threshold
- `marketplace_links` — id, marketplace, label, url, logo_url, sort_order, is_active
- `newsletter_subscribers` — id, email (unique), status, source, timestamps

**Columns to add to `products`:**
- slug (unique), short_description, compare_at_price, weight_value, weight_unit, pieces_min, pieces_max
- is_featured, is_best_seller, is_new, is_promo
- rating_average (x100), rating_count, sold_count
- cooking_instructions, storage_instructions
- seo_title, seo_description
- category_id (FK to categories, nullable initially)

**Legacy compatibility:**
- Keep `products.category` text field during transition; backfill from categories table
- Keep `products.image_url` for one release; backfill into `product_media` as primary

---

## 5. API Endpoints

### 5.1 Public API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/products` | List active products (`?q=` search) |
| GET | `/api/products/[id]` | Single product detail |
| GET | `/api/payment-settings` | Active bank accounts + transfer instructions |
| POST | `/api/auth/register` | Customer registration |
| POST | `/api/auth/login` | Login → sets `raf_auth_session` cookie |
| GET | `/api/auth/session` | Current authenticated user |
| POST | `/api/auth/logout` | Destroy session, clear cookie |
| GET | `/api/cart` | Cart contents (by `raf_cart_session` cookie) |
| POST | `/api/cart/items` | Add item to cart |
| PATCH | `/api/cart/items/[id]` | Update cart item quantity |
| DELETE | `/api/cart/items/[id]` | Remove cart item |
| POST | `/api/checkout/shipping` | Submit shipping → create order (validates stock, deducts, clears cart) |
| GET | `/api/orders/[id]` | Order detail (customer/guest scoped) |
| POST | `/api/orders/[id]/payment-proof` | Upload payment proof image |
| GET | `/api/account/profile` | Authenticated user profile |
| PATCH | `/api/account/profile` | Update profile |
| GET | `/api/account/orders` | Paginated order history |

### 5.2 Admin API (all require `requireAdmin`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/products` | List all products (`?includeDeleted=true`) |
| POST | `/api/admin/products` | Create product |
| GET | `/api/admin/products/[id]` | Admin product detail |
| PATCH | `/api/admin/products/[id]` | Update product |
| DELETE | `/api/admin/products/[id]` | Soft-delete product |
| PATCH | `/api/admin/products/[id]/stock` | Direct stock update |
| GET | `/api/admin/stock` | Stock dashboard (search, summary) |
| GET | `/api/admin/stock/movements` | Paginated stock movement history |
| POST | `/api/admin/stock/movements` | Create stock movement |
| GET | `/api/admin/orders` | List all orders |
| PATCH | `/api/admin/orders/[id]` | Update payment/order status |
| GET/POST | `/api/admin/payment-settings/accounts` | Bank accounts CRUD |
| PATCH/DELETE | `/api/admin/payment-settings/accounts/[id]` | Bank account update/delete |
| GET/POST | `/api/admin/payment-settings/instructions` | Transfer instructions CRUD |
| PATCH/DELETE | `/api/admin/payment-settings/instructions/[id]` | Instruction update/delete |

### 5.3 API Gaps for Jasmine

**New public endpoints needed:**
- `GET /api/storefront/home` — Assembled homepage DTO
- `GET /api/products` — Enhanced with category, promo, featured, bestSeller, sort, minPrice, maxPrice, inStock params
- `GET /api/products/:slug` — By slug (not just ID), with ordered media[] collection
- `GET /api/categories` — Active ordered categories
- `POST /api/newsletter` — Subscribe email

**New admin endpoints needed:**
- Product media: `POST/PATCH/DELETE /api/admin/products/:id/media`, `PUT /api/admin/products/:id/media/reorder`
- Categories CRUD: `/api/admin/categories`
- Heroes CRUD: `/api/admin/heroes`
- Promo banners CRUD: `/api/admin/promo-banners`
- Testimonials CRUD: `/api/admin/testimonials`
- Trust items + cooking steps CRUD
- Site settings: `GET/PATCH /api/admin/site-settings`
- Marketplace links CRUD

---

## 6. Auth & Authorization

### 6.1 Session Model
- Cookie-based: `raf_auth_session` (httpOnly, sameSite lax, secure in production)
- Token: random 32-byte base64url string
- Stored as SHA-256 hash in `auth_sessions` table
- 7-day expiry

### 6.2 Password Hashing
- Node.js `scrypt` (64-byte key, 16-byte salt)
- Format: `scrypt$${salt}$${keyHex}`
- Timing-safe comparison

### 6.3 Roles
- `customer` — default; browse, cart, checkout, profile, order history
- `admin` — full admin dashboard + admin API access

### 6.4 Admin Guard
- `lib/admin-auth.ts` — `requireAdmin()`
- Dual-path: session cookie with `role === "admin"`, OR `Bearer` token matching `ADMIN_API_KEY` env
- Dev fallback: hardcoded key `raf-store-admin-development-key` when `ADMIN_API_KEY` not set

### 6.5 Cart Session
- Cookie: `raf_cart_session` (HMAC-SHA256 signed)
- 30-day TTL
- Guest checkout supported via `guest:{sessionKey}` customer_id

### 6.6 Auth Gaps for Jasmine
- No middleware — all auth checks are route-level (acceptable, no change needed)
- Seed credentials will need updating for Jasmine branding
- Order number format `RAF-YYYYMMDD-XXXX` should change to `JAS-` or similar

---

## 7. Services & Lib Modules

| File | Purpose |
|------|---------|
| `lib/admin-auth.ts` | `requireAdmin()` — session/Bearer check with dev fallback |
| `lib/auth-session.ts` | Session CRUD: create, get user, delete, cookie handling |
| `lib/password.ts` | `hashPassword` / `verifyPassword` (scrypt) |
| `lib/cart-service.ts` | `getOrCreateCart`, `getCartPayload`, `findCartItemForSession` |
| `lib/cart-session.ts` | Cart session cookie read/create (HMAC signed) |
| `lib/cart-session-signature.ts` | HMAC-SHA256 signing/verification for cart cookies |
| `lib/stock-service.ts` | `deductStockForOrder` — transactional with optimistic locking (CAS) |
| `lib/order-number.ts` | `createOrderNumber()` — `RAF-YYYYMMDD-XXXX` format |
| `lib/products-api.ts` | Client-side fetcher for `/api/products` |
| `lib/product-mapper.ts` | `toProduct()` — DB row → API type |
| `lib/admin-product.ts` | `parseProductInput()`, `toAdminProduct()` |
| `lib/bank-account.ts` | `parseBankAccountInput()` validation |
| `lib/transfer-instruction.ts` | `parseTransferInstructionInput()` validation |
| `lib/client-api.ts` | `apiFetch<T>()` generic fetch wrapper + `ApiError` |

### Lib Gaps for Jasmine
- **New services needed:** homepage query service, catalog query service (with filters/sort/pagination), product detail query (with media), media storage adapter, content services (hero, promo, testimonial, trust, cooking)
- **New modules needed:** validation schemas (Zod recommended), cache tag management, slug generation/normalization
- `lib/order-number.ts` — prefix change from `RAF-` to brand-appropriate

---

## 8. Migration History

| Migration | File |
|-----------|------|
| 0000 | `0000_flawless_titania.sql` |
| 0001 | `0001_noisy_shriek.sql` |
| 0002 | `0002_serious_ultimatum.sql` |
| 0003 | `0003_lean_retro_girl.sql` |
| 0004 | `0004_workable_shockwave.sql` |
| 0005 | `0005_goofy_thunderbird.sql` |
| 0006 | `0006_wandering_madripoor.sql` |
| 0007 | `0007_spotty_nick_fury.sql` |
| 0008 | `0008_remarkable_professor_monster.sql` |
| 0009 | `0009_easy_carlie_cooper.sql` |
| 0010 | `0010_nervous_tony_stark.sql` |

Total: 11 migrations. Jasmine revamp must be **additive only** — never remove or modify existing migration files. New migrations start at 0011.

---

## 9. Seed Data

### Current Seed (`scripts/seed.mjs`)

**Users:**
- Admin: `admin@rafstore.id` / `Admin#Raf2026` (role: admin)
- Customer: `rafi.ahmad@example.com` / `RafStore#2026` (role: customer)

**Products (8 non-food items):**
| SKU | Name | Category | Price |
|-----|------|----------|-------|
| RF-TS-001 | Everyday Canvas Tote | Tas & Aksesori | 189,000 |
| RF-HM-002 | Classic Ceramic Mug | Perlengkapan Rumah | 89,000 |
| RF-DC-003 | Minimal Desk Lamp | Dekorasi | 329,000 |
| RF-ST-004 | Linen Daily Notebook | Alat Tulis | 69,000 |
| RF-WL-005 | Wooden Aroma Diffuser | Wellness | 279,000 |
| RF-DR-006 | Insulated Travel Bottle | Perlengkapan Minum | 219,000 |
| RF-HM-007 | Soft Cotton Throw | Perlengkapan Rumah | 249,000 |
| RF-WL-008 | Scented Soy Candle | Wellness | 129,000 |

**Bank Accounts (2):**
- BCA: 1234567890, "RAF STORE INDONESIA"
- Bank Mandiri: 9876543210012, "RAF STORE INDONESIA"

**Transfer Instructions (4):**
1. Transfer sesuai total
2. Gunakan rekening resmi
3. Simpan bukti
4. Tunggu verifikasi

### Seed Gaps for Jasmine
- All 8 products must be replaced with frozen food items (Chicken Katsu, Cordon Bleu, Nugget Keju, etc.)
- Brand name in bank accounts, instructions, and user names must change
- New seed data needed for: categories, hero campaigns, promo banners, trust items, cooking steps, testimonials, site settings, marketplace links
- Order number prefix must change from `RAF-` to Jasmine-appropriate

---

## 10. Build & Dev Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Production server |
| `lint` | `eslint .` | ESLint |
| `db:generate` | `drizzle-kit generate` | Generate migration SQL |
| `db:migrate` | `drizzle-kit migrate` | Run pending migrations |
| `db:seed` | `node scripts/seed.mjs` | Seed database |
| `db:studio` | `drizzle-kit studio` | Drizzle Studio (DB browser) |

**No test framework configured.** No `test` or `e2e` script in package.json. Jasmine revamp may need to add testing infrastructure in Phase 6.

---

## 11. Branding & Styling (Current → Target)

### 11.1 Current State (Raf Store)

| Element | Current Value |
|---------|---------------|
| Brand name | "Raf Store" |
| Metadata title | "Raf Store — Belanja Pilihan, Setiap Hari" |
| Metadata description | "Temukan produk pilihan berkualitas untuk kebutuhan sehari-hari." |
| CSS variables | `--background: #fafaf9`, `--foreground: #1c1917` |
| Fonts | Geist Sans + Geist Mono |
| Color scheme | Neutral/warm (stone tones) |
| Logo | Not present (text-based header) |
| Order prefix | `RAF-` |
| Cookie names | `raf_auth_session`, `raf_cart_session` |
| Admin email | `admin@rafstore.id` |
| Account holder | "RAF STORE INDONESIA" |

### 11.2 Target State (Jasmine Frozen Food)

| Element | Target Value |
|---------|--------------|
| Brand name | "Jasmine Frozen Food" |
| Tagline | "Frozen Food Premium untuk keluarga Indonesia." |
| Hero headline | "Frozen Food Premium, Praktis Seperti Masakan Restoran." |
| Primary color | `--brand-500: #D62828` (red) |
| Accent color | `--accent-500: #F59E0B` (amber) |
| Background | `--cream-50: #FFFDF8`, `--cream-100: #FFF7EB` |
| Text | `--ink-950: #171311`, `--ink-700: #4C443F` |
| Border | `--border: #E9DDD3` |
| Success | `--success: #2E7D32` |
| Max content width | 1440px |
| Product grid | 5–6 cards desktop, 3 tablet, 2 mobile |
| Card radius | 12px |
| Button radius | 8–10px |

---

## 12. Gaps Summary — Raf Store vs Jasmine Target

### Critical Gaps (Must Close)

| Gap | Impact | Target Phase |
|-----|--------|--------------|
| No categories table | Cannot organize products | Phase 4 (B01–B04) |
| Single `image_url` per product | No multi-image/video gallery | Phase 4 (B04a–B04c) |
| No CMS content tables | Homepage sections hardcoded | Phase 4 (B01–B04) |
| No homepage query service | Cannot assemble homepage from DB | Phase 4 (B05) |
| No product media manager | Admin cannot manage galleries | Phase 5 (M02) |
| "Raf Store" branding throughout | Wrong brand identity | Phase 1 (F01–F02) |
| Non-food seed products | Irrelevant catalog | Phase 4 (B04) |

### Medium Gaps (Should Close)

| Gap | Impact | Target Phase |
|-----|--------|--------------|
| `catalog-section.tsx` oversized | Hard to maintain/extend | Phase 2 (H05) |
| No `/produk` dedicated page | Homepage conflates hero + catalog | Phase 3 (C01) |
| No category browse route | No category-based shopping | Phase 3 (C03) |
| Fixed 20,000 IDR shipping | No configurable threshold | Phase 4 (site_settings) |
| `RAF-` order prefix | Wrong brand | Phase 4 |
| No SEO structured data | Missing JSON-LD | Phase 6 (Q04) |
| No Zod validation | Inconsistent validation | Phase 5 (M07) |

### Minor Gaps (Nice to Have)

| Gap | Impact | Target Phase |
|-----|--------|--------------|
| No newsletter subscriber table | No email capture | Phase 4 |
| No marketplace links table | Hardcoded marketplace info | Phase 4 |
| No `prefers-reduced-motion` check | Accessibility gap | Phase 2 |
| No image optimization (responsive sizes) | Performance gap | Phase 6 (Q05) |

---

## 13. Regression Risk Areas

These existing flows MUST continue working after the revamp:

### 13.1 Cart Flow
- **Risk:** Cart provider contract changes during component refactoring
- **Mitigation:** `cart-provider.tsx` interface must remain stable; new product cards use same `useCart()` hook
- **Test:** Guest add → view cart → update quantity → proceed to checkout

### 13.2 Checkout & Order Creation
- **Risk:** Shipping cost hardcoded at 20,000 IDR; order number uses `RAF-` prefix
- **Mitigation:** Make shipping configurable via `site_settings`; change prefix in `order-number.ts`
- **Test:** Complete checkout → order created → stock deducted → cart cleared

### 13.3 Stock Deduction
- **Risk:** `deductStockForOrder` uses optimistic locking (CAS); concurrent checkouts could fail differently
- **Mitigation:** Do not change `lib/stock-service.ts` logic; only update if prefix changes affect order numbers
- **Test:** Rapid double-checkout of last item → exactly one succeeds, stock = 0

### 13.4 Payment Proof Upload
- **Risk:** File saved to `public/uploads/payment-proofs/`; path could break if static file handling changes
- **Mitigation:** Keep upload directory; do not move to new storage adapter for payment proofs in P0
- **Test:** Upload proof → order status → `awaiting_verification` → admin sees file

### 13.5 Auth & Session
- **Risk:** Cookie names `raf_auth_session` / `raf_cart_session` are brand-specific
- **Mitigation:** Keep existing cookie names for backward compatibility; do NOT rename during revamp
- **Test:** Register → login → access admin → logout → cart persists for guest

### 13.6 Admin Product Management
- **Risk:** Product form fields expand significantly; existing CRUD must not break
- **Mitigation:** Additive schema changes only; existing fields remain; new fields have defaults
- **Test:** Create product → edit → soft-delete → verify not visible publicly

---

## Appendix A: File System Quick Reference

```
frozenstore/
├── app/
│   ├── layout.tsx              # Root layout (AuthProvider > CartProvider)
│   ├── page.tsx                # Homepage (hero + catalog)
│   ├── globals.css             # Tailwind + CSS vars
│   ├── produk/[id]/page.tsx    # Product detail
│   ├── keranjang/page.tsx      # Cart
│   ├── checkout/page.tsx       # Checkout
│   ├── daftar/page.tsx         # Register
│   ├── masuk/page.tsx          # Login
│   ├── akun/page.tsx           # Account profile
│   ├── akun/pesanan/page.tsx   # Order history
│   ├── api/                    # All API routes (public + admin)
│   └── admin/                  # Admin pages
├── components/                 # 27 components (providers, customer, admin)
├── lib/                        # 14 modules (auth, cart, stock, orders, utils)
├── db/
│   └── schema.ts               # Drizzle schema (9 tables)
├── drizzle/                    # 11 migrations (0000–0010)
├── scripts/
│   └── seed.mjs                # Database seeder
├── data/
│   ├── raf-store.db            # SQLite database
│   └── mock-*.ts               # Mock data files
├── public/                     # Static assets
├── docs/revamp/                # Revamp documentation
│   └── jasmine-frozen-food-agent-pack/  # This agent pack
├── package.json                # Dependencies & scripts
├── drizzle.config.ts           # Drizzle Kit config
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript config
├── eslint.config.mjs           # ESLint config
└── postcss.config.mjs          # PostCSS (Tailwind)
```

---

*This audit is the baseline for all subsequent revamp phases. Any file or behavior not listed here should be treated as unknown and investigated before modification.*
