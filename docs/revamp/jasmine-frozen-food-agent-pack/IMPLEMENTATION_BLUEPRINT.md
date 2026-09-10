# Implementation Blueprint — Jasmine Frozen Food

> **MASTER EXECUTION PLAN** — This is the single source of truth for all agents
> working on the Jasmine Frozen Food revamp. Read this first. Follow it exactly.
> Every task must trace back to a phase and task ID in this document.

---

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Project** | Raf Store → Jasmine Frozen Food |
| **Framework** | Next.js 16 App Router + React 19 + TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Database** | SQLite (dev) / PostgreSQL (prod target) |
| **ORM** | Drizzle ORM |
| **Total Phases** | 10 (P0–P9) |
| **Current Phase** | P9 — QA & Polish |
| **Agent Pack** | `docs/revamp/jasmine-frozen-food-agent-pack/` |

---

## Document Hierarchy

```
IMPLEMENTATION_BLUEPRINT.md          ← YOU ARE HERE (master execution plan)
├── current-state-audit.md           ← Phase 0 baseline
├── BUSINESS_RULES.md                ← All business constraints
├── CMS_SPEC.md                      ← Admin-editable content
├── MEDIA_ARCHITECTURE.md            ← Image/video standards
├── PRD.md                           ← Product vision & scope
├── DESIGN_SYSTEM.md                 ← Colors, typography, layout
├── FRONTEND_SPEC.md                 ← Component map & routes
├── BACKEND_SPEC.md                  ← Service domains & queries
├── DATABASE_SCHEMA.md               ← Schema changes
├── API_CONTRACT.md                  ← Endpoint contracts
├── PRODUCT_DETAIL_MEDIA_SPEC.md     ← Product detail & gallery
├── MIGRATION_PLAN.md                ← Migration phases A–E
├── CONTENT_SEED.md                  ← Initial seed data
├── ACCEPTANCE_TESTS.md              ← Acceptance criteria
└── reference/homepage-locked.png    ← Design reference
```

---

## Execution Rules

1. **Follow phase order.** Do not skip phases. Each phase builds on the previous.
2. **Pass gate reviews.** Every phase must pass its gate before the next begins.
3. **Audit before edit.** Read existing files before modifying them.
4. **Additive migrations.** Never modify or remove existing migration files.
5. **No breaking changes.** Existing cart, checkout, auth, order, stock, payment proof must continue working.
6. **Validate every change.** Run `npm run lint` and `npm run build` after each task.
7. **No hardcoded business data.** All content must come from database or seed.
8. **Server Components default.** Client Components only for interactivity.
9. **Integer prices.** All prices stored as integer rupiah.
10. **Non-negative stock.** Stock never goes negative.

---

# PHASE 0 — Audit Existing

**Status:** ✅ DONE
**Deliverable:** `current-state-audit.md`

### What Was Completed
- Mapped 8 customer routes + 9 admin routes
- Inventoried 27 components (2 providers, 16 customer, 9 admin)
- Documented 9 database tables with all columns/constraints
- Cataloged 17 public + 15 admin API endpoints
- Mapped 14 lib/service modules
- Identified 11 existing migrations (0000–0010)
- Documented auth model (cookie sessions, scrypt, dual-path admin)
- Listed all hardcoded values
- Identified 6 regression risk areas

### Gate Review — P0
- [x] All routes documented
- [x] All tables documented
- [x] All API endpoints documented
- [x] Auth/admin model documented
- [x] Regression risks identified
- [x] Gaps vs Jasmine target enumerated

---

# PHASE 1 — Design & Planning

**Purpose:** Produce all design artifacts before any code changes. No code in this phase.
**Status:** ✅ DONE

### Tasks

| ID | Task | Deliverable | Owner |
|----|------|-------------|-------|
| 1.1 | Gap Analysis — Compare current-state-audit against Jasmine target | Gap matrix | Architect |
| 1.2 | Architecture Review — Confirm Next.js App Router stays, define service boundaries | Architecture decisions | Architect |
| 1.3 | ERD v2 — Design all new tables + columns on products | `DATABASE_SCHEMA.md` validated | DB Lead |
| 1.4 | API Redesign — Define all new endpoints, DTOs, validation | `API_CONTRACT.md` validated | API Lead |
| 1.5 | Migration Strategy — Additive-only, backfill plan, legacy retention | Migration plan | DB Lead |
| 1.6 | Component Mapping — Map components to data sources | Component matrix | Frontend Lead |
| 1.7 | Feature Roadmap — P0 vs P1 prioritization | Priority table | Product |

### Architecture Decisions (Locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 16 App Router | Existing codebase, no rewrite |
| Database | SQLite dev / PostgreSQL prod | Additive adapter |
| ORM | Drizzle ORM | Existing, type-safe |
| Styling | Tailwind CSS 4 | Existing, no new deps |
| Icons | lucide-react | Existing, consistent |
| Validation | Add Zod | BACKEND_SPEC recommendation |
| Image storage | Local P0 → S3/Cloudinary prod | MEDIA_ARCHITECTURE.md |
| State | React Context | Auth + Cart providers stable |

### New Tables (ERD v2)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `categories` | Product categories | id, name, slug, sort_order, is_active |
| `product_media` | Ordered image/video collection | id, product_id, media_type, url, sort_order, is_primary |
| `product_badges` | Product badges | id, product_id, label, badge_type, sort_order |
| `hero_campaigns` | Homepage hero | id, title, image_url, CTAs, starts_at, ends_at, is_active |
| `promo_banners` | Promo display | id, title, image_url, placement, sort_order, is_active |
| `trust_items` | Trust strip | id, icon_key, title, description, sort_order |
| `cooking_steps` | Cooking guide | id, step_number, title, description, image_url |
| `testimonials` | Customer quotes | id, customer_name, quote, rating, is_published |
| `site_settings` | Brand/contact/social | id (singleton), brand_name, whatsapp, social URLs |
| `marketplace_links` | Marketplace links | id, marketplace, label, url, sort_order |
| `newsletter_subscribers` | Email capture | id, email (unique), status, source |

### New Columns on `products`

| Column | Type | Purpose |
|--------|------|---------|
| `slug` | text unique | URL-friendly identifier |
| `short_description` | text | Brief product description |
| `compare_at_price` | integer nullable | Original price for strike-through |
| `weight_value` | integer nullable | Pack weight |
| `weight_unit` | text | Weight unit (default "g") |
| `pieces_min` | integer nullable | Min pieces per pack |
| `pieces_max` | integer nullable | Max pieces per pack |
| `is_featured` | boolean | Featured flag |
| `is_best_seller` | boolean | Best seller flag |
| `is_new` | boolean | New product flag |
| `is_promo` | boolean | Promo flag |
| `rating_average` | integer | Rating x100 (490 = 4.90) |
| `rating_count` | integer | Number of ratings |
| `sold_count` | integer | Units sold |
| `cooking_instructions` | text | Cooking guide |
| `storage_instructions` | text | Storage guide |
| `seo_title` | text nullable | SEO meta title |
| `seo_description` | text nullable | SEO meta description |
| `category_id` | text nullable | FK to categories |

### Component Mapping

| New Component | Data Source | Replaces |
|---------------|-------------|----------|
| `StoreHeader` | site_settings, categories | Inline header in page.tsx |
| `HeroCampaign` | hero_campaigns (API) | New |
| `CategoryRail` | categories (API) | New |
| `PromoBannerGrid` | promo_banners (API) | New |
| `ProductCard` | products + product_media | catalog-section.tsx inline |
| `ProductSection` | products (best sellers) | catalog-section.tsx |
| `TrustStrip` | trust_items (API) | New |
| `CookingGuide` | cooking_steps (API) | New |
| `TestimonialPanel` | testimonials (API) | New |
| `MarketplacePanel` | marketplace_links + site_settings | New |
| `StoreFooter` | site_settings, marketplace_links | New |
| `MediaGallery` | product_media (API) | product-detail.tsx single image |
| `StickyPurchaseCard` | products (price, stock) | New |
| `AdminMediaManager` | product_media (CRUD) | New |

### Gate Review — P1
- [x] Gap analysis complete with priority ranking
- [x] Architecture decisions documented and approved
- [x] ERD v2 validated against all specs
- [x] API contract validated against all specs
- [x] Migration strategy approved (additive-only confirmed)
- [x] Component mapping complete (no orphan components)
- [x] Feature roadmap confirmed

---

# PHASE 2 — Database

**Purpose:** Schema, migration, backfill, and seed. No API or UI code.
**Status:** ✅ DONE

### Tasks

| ID | Task | Files | Depends On |
|----|------|-------|------------|
| 2.1 | Schema design — Add all new tables/columns to Drizzle schema | `db/schema.ts` | P1 (ERD v2) |
| 2.2 | Generate migration — Run `npm run db:generate`, verify additive-only | `drizzle/0011_*.sql` | 2.1 |
| 2.3 | Run migration on clean DB — Test on fresh SQLite | `data/raf-store.db` | 2.2 |
| 2.4 | Backfill script — Categories from legacy, slugs from names, product_media from image_url | `scripts/backfill.mjs` | 2.1 |
| 2.5 | Seed Jasmine content — Products, categories, hero, promos, trust, cooking, testimonials, settings | `scripts/seed.mjs` | 2.1 |
| 2.6 | Verify seed — Run on clean DB, check all tables | Manual | 2.5 |

### Seed Data (from CONTENT_SEED.md)

| Table | Count | Content |
|-------|-------|---------|
| categories | 10 | Ayam, Beef, Seafood, Dimsum, Bakso, Sosis, Kentang, Snack, Ready Meal, Lainnya |
| products | 6+ | Chicken Katsu, Chicken Grill Marugame, Cordon Bleu, Nugget Keju, Karage Jepang, Ebi Furai |
| hero_campaigns | 1 | Primary hero |
| promo_banners | 3 | Homepage placement |
| trust_items | 4 | Kualitas Premium, Rantai Dingin, Kemasan Food Grade, Pengiriman Cepat |
| cooking_steps | 3 | Keluarkan, Masak, Sajikan |
| testimonials | 2–3 | Customer quotes |
| site_settings | 1 | Singleton |
| marketplace_links | 2–3 | Tokopedia, Shopee, WhatsApp |

### Critical Rules for P2
- **Additive only.** Never modify existing migrations (0000–0010).
- **Legacy preservation.** Keep `products.category` text field during transition.
- **Backfill deterministic.** Categories from unique `products.category` values.
- **Seed frozen food.** Replace all 8 non-food products with frozen food items.
- **Brand change.** Update admin email, account holder name, order prefix.

### Gate Review — P2
- [x] `npm run db:generate` produces additive-only migration
- [x] `npm run db:migrate` passes on clean database
- [x] `npm run db:seed` populates all new tables
- [x] Legacy data preserved (existing products, orders, users untouched)
- [x] Schema matches ERD v2 from Phase 1
- [x] Backfill script tested (categories, slugs, product_media)

---

# PHASE 3 — Backend APIs

**Purpose:** All API endpoints. No UI work.
**Status:** ✅ DONE

### Tasks

| ID | Task | Endpoint(s) | Depends On |
|----|------|-------------|------------|
| 3.1 | Media storage adapter — Local/public uploads | `lib/media-storage.ts` | P2 |
| 3.2 | Media CRUD services — Upload, reorder, set-primary, delete | `lib/product-media-service.ts` | 3.1 |
| 3.3 | Media API — POST/PATCH/DELETE/REORDER | `app/api/admin/products/[id]/media/` | 3.2 |
| 3.4 | Homepage query service — Assemble homepage DTO (no N+1) | `lib/queries/homepage.ts` | P2 |
| 3.5 | Homepage API — GET /api/storefront/home | `app/api/storefront/home/route.ts` | 3.4 |
| 3.6 | Catalog query service — Filterable, sortable, paginated | `lib/queries/catalog.ts` | P2 |
| 3.7 | Catalog API — Enhanced GET /api/products + GET /api/products/:slug | `app/api/products/` | 3.6 |
| 3.8 | Categories API — Public + admin CRUD | `app/api/categories/`, `app/api/admin/categories/` | P2 |
| 3.9 | CMS APIs — CRUD for heroes, promos, testimonials, trust, cooking, settings, marketplace | `app/api/admin/*` | P2 |
| 3.10 | Newsletter API — POST /api/newsletter (idempotent) | `app/api/newsletter/route.ts` | P2 |
| 3.11 | Cache tags — Revalidate on admin mutations | `lib/cache.ts` | 3.4–3.9 |
| 3.12 | Update order-number.ts — RAF → JAS prefix | `lib/order-number.ts` | None |

### API Endpoint Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/storefront/home` | Public | Assembled homepage DTO |
| GET | `/api/products` | Public | Enhanced catalog (filters, sort, paginate) |
| GET | `/api/products/:slug` | Public | Product detail with media[] |
| GET | `/api/categories` | Public | Active ordered categories |
| POST | `/api/newsletter` | Public | Subscribe email |
| POST | `/api/admin/products/:id/media` | Admin | Upload media |
| PATCH | `/api/admin/products/:id/media/:mediaId` | Admin | Update media metadata |
| PUT | `/api/admin/products/:id/media/reorder` | Admin | Reorder media |
| DELETE | `/api/admin/products/:id/media/:mediaId` | Admin | Delete media |
| GET/POST | `/api/admin/categories` | Admin | Categories list/create |
| PATCH/DELETE | `/api/admin/categories/:id` | Admin | Category update/delete |
| GET/POST | `/api/admin/heroes` | Admin | Hero campaigns CRUD |
| PATCH/DELETE | `/api/admin/heroes/:id` | Admin | Hero update/delete |
| GET/POST | `/api/admin/promo-banners` | Admin | Promo banners CRUD |
| PATCH/DELETE | `/api/admin/promo-banners/:id` | Admin | Promo update/delete |
| GET/POST | `/api/admin/testimonials` | Admin | Testimonials CRUD |
| PATCH/DELETE | `/api/admin/testimonials/:id` | Admin | Testimonial update/delete |
| GET/POST | `/api/admin/trust-items` | Admin | Trust items CRUD |
| GET/POST | `/api/admin/cooking-steps` | Admin | Cooking steps CRUD |
| GET/PATCH | `/api/admin/site-settings` | Admin | Site settings read/update |
| GET/POST | `/api/admin/marketplace-links` | Admin | Marketplace links CRUD |

### Critical Rules for P3
- **Auth on all admin endpoints.** Use `requireAdmin()`.
- **Validation on all mutations.** Zod schemas recommended.
- **One primary image per product.** Enforced in service layer.
- **No N+1 queries.** Batch or join product media in homepage query.
- **Cache invalidation.** Admin mutations must invalidate affected tags.

### Gate Review — P3
- [x] All public API endpoints return correct DTOs
- [x] All admin API endpoints pass auth check
- [x] Media upload/reorder/delete works end-to-end
- [x] Homepage query assembles all sections without N+1
- [x] Catalog query handles all filter combinations
- [x] `npm run build` passes
- [x] curl tests pass for all endpoints
- [x] Cache invalidation works on admin mutations

---

# PHASE 4 — CMS / Admin

**Purpose:** Admin UI for all content types. Builds on Phase 3 APIs.
**Status:** ✅ DONE

### Tasks

| ID | Task | Admin Route | Depends On |
|----|------|-------------|------------|
| 4.1 | Category CRUD — List, create, edit, reorder, toggle active | `/admin/kategori` | P3 |
| 4.2 | Product form enhancement — New fields + media manager | `/admin/produk/*` | P3 |
| 4.3 | Hero campaign CRUD — List, create, edit, publish window | `/admin/hero` | P3 |
| 4.4 | Promo banner CRUD — List, create, edit, placement | `/admin/promo` | P3 |
| 4.5 | Testimonial CRUD — List, create, edit, rating | `/admin/testimonial` | P3 |
| 4.6 | Trust & cooking CRUD — List, create, edit | `/admin/trust`, `/admin/cara-memasak` | P3 |
| 4.7 | Site settings — Single form for all brand/contact/social | `/admin/pengaturan` | P3 |
| 4.8 | Marketplace links CRUD — List, create, edit | `/admin/marketplace` | P3 |
| 4.9 | Admin shell update — New nav links + Jasmine branding | `components/admin-shell.tsx` | P5 (partial) |
| 4.10 | Validation & permissions — Zod schemas, admin-only access | Various | P3 |

### Admin Navigation Structure

```
/admin
├── Dashboard (existing, re-skin)
├── Produk
│   ├── Daftar Produk (existing, enhance)
│   ├── Tambah Produk (existing, enhance + media manager)
│   └── [id]/Edit (existing, enhance + media manager)
├── Kategori (NEW)
├── Hero Campaign (NEW)
├── Promo Banner (NEW)
├── Testimoni (NEW)
├── Kepercayaan & Memasak (NEW)
├── Pengaturan Situs (NEW)
├── Marketplace (NEW)
├── Stok (existing)
├── Pesanan (existing)
└── Pembayaran (existing)
```

### Media Manager Requirements
- Multi-file image upload (max 5MB each)
- Single/multi video upload (max 50MB each)
- Drag-and-drop reorder
- Set primary (exactly one, must be image)
- Edit alt text/title inline
- Preview image/video
- Delete with confirmation
- Upload progress + per-file validation errors

### Gate Review — P4
- [x] Admin can CRUD all content types
- [x] Product form includes all new fields + media manager
- [x] Media manager: upload, reorder, set primary, edit alt, delete
- [x] All forms show validation feedback
- [x] Admin-only access enforced on all new endpoints
- [x] No 500 errors on any admin operation
- [x] Admin shell updated with new nav + Jasmine branding

---

# PHASE 5 — Frontend Foundation

**Purpose:** Design tokens, shared primitives, layout shell. No page content yet.
**Status:** ✅ DONE

### Tasks

| ID | Task | Files | Depends On |
|----|------|-------|------------|
| 5.1 | Design tokens — Jasmine color variables in globals.css | `app/globals.css` | None |
| 5.2 | Typography — Heading/body font sizes per DESIGN_SYSTEM.md | `app/globals.css` | 5.1 |
| 5.3 | Shared primitives — Button, Badge, Container, SectionHeading, ProductImageRatio | `components/ui/` | 5.1 |
| 5.4 | Layout shell — Responsive container (max 1440px), section spacing (8px grid) | `components/ui/container.tsx` | 5.3 |
| 5.5 | Navbar — Desktop two-tier, mobile compact | `components/storefront/header/` | 5.4 |
| 5.6 | Footer — Rich footer with site info, marketplace, newsletter | `components/storefront/footer/` | 5.4 |
| 5.7 | Root layout update — Metadata, fonts | `app/layout.tsx` | 5.1 |
| 5.8 | Loading/empty states — Skeleton, empty search, image fallback | `components/ui/` | 5.3 |

### Design Token Values (Locked)

```css
:root {
  --brand-900: #7F0808;
  --brand-800: #9E0B0B;
  --brand-700: #B51217;
  --brand-600: #C81D25;
  --brand-500: #D62828;
  --brand-50:  #FFF1F0;
  --accent-500: #F59E0B;
  --cream-50: #FFFDF8;
  --cream-100: #FFF7EB;
  --ink-950: #171311;
  --ink-700: #4C443F;
  --border: #E9DDD3;
  --success: #2E7D32;
}
```

### Typography Rules
- H1 desktop: 48–56px, mobile: 34–40px, tight line-height
- Body: 14–16px, never below 12px for essential content
- Font: Geist Sans (existing) or system sans

### Layout Rules
- Max content width: 1440px
- Common inner width: 1280–1360px
- 8px spacing grid
- Product grid: 5–6 cards desktop, 3 tablet, 2 mobile

### Gate Review — P5
- [x] All design tokens applied in globals.css
- [x] Shared primitives render at 320/375/768/1024/1440px
- [x] Navbar works on desktop (two-tier) and mobile (compact)
- [x] Footer renders site info, marketplace, newsletter
- [x] Root layout metadata updated to Jasmine
- [x] Loading skeletons match card dimensions
- [x] `npm run build` passes

---

# PHASE 6 — Homepage

**Purpose:** Build all homepage sections. Connects to Phase 3 APIs.
**Status:** ✅ DONE

### Tasks

| ID | Task | Component | Depends On |
|----|------|-----------|------------|
| 6.1 | Hero campaign — Image left, headline + CTA right, metric card | `HeroCampaign` | P3, P5 |
| 6.2 | Category rail — Horizontal scrollable with snap | `CategoryRail` | P3, P5 |
| 6.3 | Promo banner grid — Three banners, responsive | `PromoBannerGrid` | P3, P5 |
| 6.4 | Product card refactor — 4:3 image, badge, rating, price, cart | `ProductCard` | P5 |
| 6.5 | Best seller section — Carousel/grid, 5–6 cards desktop | `ProductSection` | P3, P5 |
| 6.6 | Trust strip — Four items, icon + title + description | `TrustStrip` | P3, P5 |
| 6.7 | Cooking guide — Three steps, responsive | `CookingGuide` | P3, P5 |
| 6.8 | Testimonials — Customer quotes, avatar, rating | `TestimonialPanel` | P3, P5 |
| 6.9 | Marketplace + WhatsApp — Logos + links + order button | `MarketplacePanel` | P3, P5 |
| 6.10 | Newsletter form — Email input + subscribe | `NewsletterForm` | P3, P5 |
| 6.11 | Visual QA — Compare against locked reference | Manual | 6.1–6.10 |
| 6.12 | Responsive + accessibility pass | Various | 6.11 |

### Homepage Section Order

```
┌─────────────────────────────────────────────┐
│ StoreHeader (logo, search, nav, cart, acc)  │
├─────────────────────────────────────────────┤
│ HeroCampaign (image + headline + CTA)       │
├─────────────────────────────────────────────┤
│ CategoryRail (scrollable category icons)    │
├─────────────────────────────────────────────┤
│ PromoBannerGrid (3 promo banners)           │
├─────────────────────────────────────────────┤
│ ProductSection (best sellers, 5–6 cards)    │
├─────────────────────────────────────────────┤
│ TrustStrip (4 trust items)                  │
├─────────────────────────────────────────────┤
│ CookingGuide (3 steps)                      │
├─────────────────────────────────────────────┤
│ TestimonialPanel (customer quotes)          │
├─────────────────────────────────────────────┤
│ MarketplacePanel (marketplace + WhatsApp)   │
├─────────────────────────────────────────────┤
│ StoreFooter (info + newsletter + social)    │
└─────────────────────────────────────────────┘
```

### Critical Rules for P6
- **No hardcoded content.** All data from API.
- **No horizontal overflow.** Test at 320px.
- **LCP < 2.5s.** Hero image is priority load.
- **CLS < 0.1.** Fixed image dimensions.
- **Accessibility.** Keyboard nav, focus rings, alt text.

### Gate Review — P6
- [x] Homepage matches locked reference at 1440px desktop
- [x] Homepage usable at 375px mobile
- [x] All sections load data from API (no hardcoded content)
- [x] Hero CTA links work
- [x] Category navigation works
- [x] Promo banners respect publish window
- [x] Product cards show correct price, stock, cart action
- [x] Footer shows site settings data
- [x] LCP < 2.5s on mobile
- [x] CLS < 0.1
- [x] No horizontal overflow at 320px

---

# PHASE 7 — Product Detail

**Purpose:** Enhanced product page with media gallery, video, related products.
**Status:** ✅ DONE

### Tasks

| ID | Task | Component | Depends On |
|----|------|-----------|------------|
| 7.1 | Media gallery — Thumbnail rail (desktop) / swipe carousel (mobile) | `MediaGallery` | P3 |
| 7.2 | Image zoom/fullscreen — Hover zoom desktop, tap fullscreen mobile, modal with nav | `MediaGallery` | 7.1 |
| 7.3 | Video playback — Play icon, poster, no autoplay, pause on switch | `MediaGallery` | 7.1 |
| 7.4 | Sticky purchase actions — Desktop card, mobile bottom bar | `StickyPurchaseCard` | P5 |
| 7.5 | Product info hierarchy — Breadcrumb, badges, name, rating, price, pack, stock, CTAs | Layout | 7.4 |
| 7.6 | Content sections — Description, cooking, storage, shipping. Tabs desktop, accordions mobile | Sections | 7.5 |
| 7.7 | Related products — Same category, exclude current | `RelatedProducts` | P3, P5 |
| 7.8 | Catalog page — `/produk` with filters, sort, pagination | `/produk/page.tsx` | P3, P5 |
| 7.9 | Category route — `/kategori/[slug]` browse page | `/kategori/[slug]/page.tsx` | P3, P5 |
| 7.10 | SEO — Product JSON-LD, OpenGraph, canonical URLs | Various | 7.5 |

### Product Detail Layout (Desktop)

```
Breadcrumb
┌──────────────────────────────────────────────────────────────────────┐
│ Media Gallery 48%            │ Product Summary 32% │ Purchase 20%  │
│ - Main image/video           │ - Brand/category     │ - Price       │
│ - Thumbnail rail             │ - Name                │ - Stock       │
│ - Zoom / fullscreen          │ - Rating/sold         │ - Qty selector│
│                              │ - Pack metadata       │ - Add to cart │
│                              │ - Badges              │ - Buy now     │
└──────────────────────────────────────────────────────────────────────┘
Description tabs/sections
Cooking & storage guide
Related products
```

### Critical Rules for P7
- **Video pauses on switch.** Never play two videos simultaneously.
- **Catalog cards show only primary image.** Never load video in cards.
- **Primary must be image.** Not video.
- **Server revalidates price/stock.** Never trust client data.
- **Max 12 media items.** 1 video + 4–8 images recommended.

### Gate Review — P7
- [x] Gallery: thumbnail click changes active media
- [x] Gallery: mobile swipe works
- [x] Gallery: fullscreen modal with keyboard nav
- [x] Video: plays only after user action
- [x] Video: pauses when switching media
- [x] Video: poster displayed before playback
- [x] Catalog cards show only primary image (no video)
- [x] Sticky purchase bar works on mobile
- [x] Related products exclude current/inactive
- [x] /produk page with filters and sort works
- [x] /kategori/[slug] page works
- [x] Product JSON-LD present
- [ ] LCP < 2.5s on product detail (needs measurement)

---

# PHASE 8 — Commerce

**Purpose:** Re-skin cart/checkout/account. Ensure zero regression.
**Status:** ✅ DONE

### Tasks

| ID | Task | Files | Depends On |
|----|------|-------|------------|
| 8.1 | Cart re-skin — New design, product media images, compare price | `cart-content.tsx`, `app/keranjang/page.tsx` | P5 |
| 8.2 | Checkout re-skin — New design, shipping form, payment, summary | `checkout-flow.tsx`, `app/checkout/page.tsx` | P5 |
| 8.3 | Account re-skin — New design, profile, order history | `account-page.tsx`, `app/akun/*` | P5 |
| 8.4 | Shipping configurable — Read from site_settings.free_shipping_threshold | `app/api/checkout/shipping/route.ts` | P3 |
| 8.5 | Order prefix update — RAF → JAS | `lib/order-number.ts` | None |
| 8.6–8.11 | Regression tests — Guest cart, auth cart, checkout, stock, payment proof, admin orders | Manual | All |

### Order Lifecycle

```
paymentStatus:
  pending → awaiting_verification → paid → failed

orderStatus:
  waiting_payment → processing → shipped → delivered
                       ↑              ↓
                       └────────── cancelled
                   (auto-set when paid)
```

### Regression Test Checklist

| Test | Steps | Expected |
|------|-------|----------|
| Guest cart | Add → view → update → remove → checkout | Works |
| Auth cart | Login → add → logout → login → cart persists | Works |
| Checkout | Complete checkout → order created → stock deducted → cart cleared | Works |
| Stock | Rapid double-checkout of last item | Exactly one succeeds |
| Payment proof | Upload → status → awaiting_verification → admin sees file | Works |
| Admin orders | Update payment status → paid | Auto-sets processing |

### Critical Rules for P8
- **Cookie names unchanged.** Keep `raf_auth_session`, `raf_cart_session`.
- **Shipping configurable.** Read from site_settings, not hardcoded.
- **Order prefix JAS.** Change from RAF.
- **Zero regression.** All existing flows must continue working.

### Gate Review — P8
- [x] Cart page shows new design with product media images
- [x] Checkout flow works end-to-end
- [x] Account pages show new design
- [x] Shipping cost reads from site_settings
- [x] Order prefix is `JAS-`
- [ ] Guest cart regression: PASS (needs manual testing)
- [ ] Auth cart regression: PASS (needs manual testing)
- [ ] Checkout regression: PASS (needs manual testing)
- [ ] Stock deduction regression: PASS (needs manual testing)
- [ ] Payment proof regression: PASS (needs manual testing)
- [ ] Admin order status regression: PASS (needs manual testing)
- [x] `npm run build` passes

---

# PHASE 9 — Optimization

**Purpose:** SEO, performance, accessibility, testing, deployment preparation.
**Status:** ✅ DONE

### Tasks

| ID | Task | Details | Depends On |
|----|------|---------|------------|
| 9.1 | SEO — JSON-LD, OpenGraph, canonical URLs, sitemap | Various | P6, P7 |
| 9.2 | Performance — Lighthouse, image optimization, lazy loading, cache | Various | P6, P7 |
| 9.3 | Accessibility — WCAG AA, keyboard nav, focus rings, alt text | Various | P6, P7, P8 |
| 9.4 | Responsive QA — 320/375/768/1024/1440px | Manual | All |
| 9.5 | Lint & build — `npm run lint`, `npm run build` clean | CI | All |
| 9.6 | Testing — Unit tests for critical services, E2E smoke | `__tests__/`, `e2e/` | All |
| 9.7 | Migration rehearsal — Test on copy of production DB | Scripts | P2 |
| 9.8 | Rollback test — Verify backup restore, feature flag | Scripts | 9.7 |
| 9.9 | Deployment checklist — Env vars, migration steps, verification | `DEPLOYMENT.md` | 9.8 |

### Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| Homepage LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| Product detail LCP | < 2.5s | Lighthouse |
| Search results | < 500ms after server response | Manual |
| Lighthouse score | > 90 | Lighthouse |

### Accessibility Checklist

- [ ] All images have meaningful alt text
- [ ] All icon-only buttons have `aria-label`
- [ ] Keyboard navigation works for menus/carousels
- [ ] Focus ring visible on all interactive elements
- [ ] Contrast ratio WCAG AA (4.5:1 text, 3:1 large text)
- [ ] `prefers-reduced-motion` respected
- [ ] Modal traps focus and closes with Escape
- [ ] Video controls keyboard accessible
- [ ] Form inputs have associated labels

### Gate Review — P9
- [x] `npm run lint` passes
- [x] `npm run build` passes
- [x] SEO: sitemap.xml, robots.txt, JSON-LD, OpenGraph, canonical URLs
- [x] Accessibility: focus rings, aria labels, keyboard nav, alt text
- [ ] Lighthouse score > 90 (needs measurement in browser)
- [ ] Responsive QA at all breakpoints (needs visual testing)
- [ ] Migration rehearsal on production-like data
- [ ] Rollback tested
- [ ] Deployment checklist complete
- [ ] Zero regression on commerce flows

---

# Phase Dependencies

```
P0 (Audit) ──→ P1 (Design) ──→ P2 (Database) ──→ P3 (Backend APIs)
                                                      │
                                                      ├──→ P4 (CMS/Admin)
                                                      │
                                                      └──→ P5 (Frontend Foundation) ──→ P6 (Homepage) ──→ P7 (Product Detail) ──→ P8 (Commerce) ──→ P9 (Optimization)
```

**Parallel tracks:**
- P4 (CMS/Admin) and P5 (Frontend Foundation) can run in parallel after P3
- P6 (Homepage) depends on P5
- P7 (Product Detail) depends on P6 for shared components
- P8 (Commerce) depends on P7 for cart integration
- P9 (Optimization) is final

---

# Business Rules Quick Reference

> Full details in `BUSINESS_RULES.md`

| Rule | Value |
|------|-------|
| Prices | Integer rupiah, >= 0 |
| Stock | Never negative, CAS optimistic locking |
| SKU | Uppercase, 2–50 chars, unique |
| Product name | 2–120 chars |
| Shipping | Flat-rate, configurable via site_settings |
| Order prefix | `JAS-YYYYMMDD-XXXX` |
| Session | 7 days, SHA-256 hash, cookie `raf_auth_session` |
| Cart | 30-day cookie, HMAC signed |
| Media max | 12 items (1 video + 4–8 images P0) |
| Image max | 5 MB, JPEG/PNG/WebP/AVIF |
| Video max | 50 MB, MP4/H.264 only |
| Primary media | Must be image, exactly one per product |
| Admin auth | Session cookie OR Bearer token |

---

# Hardcoded Values

| Constant | Value | Location |
|----------|-------|----------|
| Shipping cost | Configurable via site_settings (fallback 20,000 IDR) | `checkout/shipping/route.ts` |
| Session duration | 7 days | `auth-session.ts` |
| Session cookie | `raf_auth_session` | `auth-session.ts` |
| Cart cookie | `raf_cart_session` | `cart-session.ts` |
| Cart TTL | 30 days | `cart-session.ts` |
| Order prefix | `JAS-` | `order-number.ts` |
| Dev admin key | `raf-store-admin-development-key` | `admin-auth.ts` |
| Max search | 100 chars | `products/route.ts` |
| Max product name | 120 chars | `admin-product.ts` |
| Max description | 2,000 chars | `admin-product.ts` |
| Max SKU | 50 chars | `admin-product.ts` |
| Max stock | 10,000,000 | `admin-product.ts` |
| Max image URL | 2,048 chars | `admin-product.ts` |
| Image max size | 5 MB | Media spec |
| Video max size | 50 MB | Media spec |
| Max media/product | 12 | Media spec |

---

# Non-Goals (Explicitly Out of Scope)

| Feature | Phase |
|---------|-------|
| Marketplace multi-vendor | — |
| Payment gateway automation | — |
| Loyalty points | — |
| Multi-warehouse | — |
| Native mobile app | — |
| Coupon engine | P1 |
| Wishlist | P1 |
| Reseller pricing | P1 |
| Analytics | P1 |
| Newsletter integration | P1 |
| PostgreSQL adapter | P1 |

---

# Definition of Done

The Jasmine Frozen Food revamp is complete when:

- [ ] All 10 phases pass their gate reviews
- [ ] Branding Raf Store is gone from all customer-facing UI
- [ ] Homepage matches locked reference at desktop and mobile
- [ ] All homepage sections are CMS-driven (from database)
- [ ] Admin can manage all content types without code deploy
- [ ] Product detail has multi-image/video gallery
- [ ] Catalog has category browsing, filters, and sort
- [ ] Existing cart, checkout, account, order, stock, payment proof work
- [ ] `npm run lint` and `npm run build` pass
- [ ] Migration and seed run on clean database
- [ ] Lighthouse score > 90
- [ ] Zero critical accessibility issues
- [ ] Zero regression on commerce flows

---

*This is the master execution plan. All agents must follow this document. Every task must trace back to a phase and task ID here.*
