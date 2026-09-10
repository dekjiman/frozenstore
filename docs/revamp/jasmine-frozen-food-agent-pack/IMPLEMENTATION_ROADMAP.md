# Implementation Roadmap — Jasmine Frozen Food Revamp

> 10-phase execution plan with gate reviews. Each phase must pass its gate before
> the next phase begins. This document supersedes `IMPLEMENTATION_ORDER.md`.

---

## Reading Order

1. `current-state-audit.md` (Phase 0 deliverable — baseline)
2. `IMPLEMENTATION_ROADMAP.md` (this document — execution plan)
3. `BUSINESS_RULES.md` (all business constraints)
4. `CMS_SPEC.md` (admin-editable content)
5. `MEDIA_ARCHITECTURE.md` (image/video standards)
6. Then existing specs: PRD, DESIGN_SYSTEM, FRONTEND_SPEC, BACKEND_SPEC, etc.

---

## Phase 0 — Audit Existing

**Status:** ✅ DONE

**Deliverable:** `current-state-audit.md`

**What was done:**
- Mapped all 8 customer routes + 9 admin routes
- Inventoried 27 components (2 providers, 16 customer, 9 admin)
- Documented 9 database tables with all columns/constraints
- Cataloged 17 public + 15 admin API endpoints
- Mapped 14 lib/service modules
- Identified 11 existing migrations (0000–0010)
- Documented auth model (cookie sessions, scrypt, dual-path admin)
- Listed all hardcoded values (shipping 20k, order prefix RAF-, session 7 days)
- Identified regression risk areas (cart, checkout, stock, payment proof)

### Gate Review — Phase 0
- [x] All routes documented
- [x] All tables documented
- [x] All API endpoints documented
- [x] Auth/admin model documented
- [x] Regression risks identified
- [x] Gaps vs Jasmine target enumerated

---

## Phase 1 — Design & Planning

**Purpose:** Produce all design artifacts before any code changes. No code in this phase.

**Status:** ✅ DONE

### Tasks

| ID | Task | Deliverable |
|----|------|-------------|
| 1.1 | **Gap Analysis** — Compare current-state-audit against Jasmine target. List every gap by priority (critical/medium/minor). | Gap matrix in this doc |
| 1.2 | **Architecture Review** — Confirm monolithic Next.js App Router stays. Define service layer boundaries (catalog, content, commerce, media). Document caching strategy (revalidate 60–300s, tag-based). | Architecture section below |
| 1.3 | **ERD v2** — Design all new tables (categories, product_media, product_badges, hero_campaigns, promo_banners, trust_items, cooking_steps, testimonials, site_settings, marketplace_links, newsletter_subscribers). Add new columns to products. Define constraints/indexes. | `DATABASE_SCHEMA.md` (already exists, validate) |
| 1.4 | **API Redesign** — Define all new endpoints. Specify request/response DTOs. Define validation rules. Map to service functions. | `API_CONTRACT.md` (already exists, validate) |
| 1.5 | **Migration Strategy** — Additive-only approach. Backfill plan for categories from legacy `products.category`. Backfill plan for `product_media` from `products.image_url`. Legacy column retention period. | Migration section below |
| 1.6 | **Component Mapping** — Map each new frontend component to its data source (API/DTO). Identify which existing components are reused vs new. Define component hierarchy. | Component matrix below |
| 1.7 | **Feature Roadmap** — Prioritize P0 vs P1 features. Confirm non-goals (multi-vendor, payment gateway, loyalty, multi-warehouse, native app). | Feature priority table below |

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 16 App Router (keep) | Existing codebase, no rewrite |
| Database | SQLite dev / PostgreSQL prod target | Additive adapter, no blocker |
| ORM | Drizzle ORM (keep) | Existing, type-safe |
| Styling | Tailwind CSS 4 (keep) | Existing, no new deps |
| Icons | lucide-react (keep) | Existing, consistent |
| Validation | Add Zod | Recommended by BACKEND_SPEC |
| Image storage | Local/public (P0) → S3/Cloudinary (prod) | MEDIA_ARCHITECTURE.md |
| State management | React Context (keep) | Auth + Cart providers stable |

### Component Mapping

| New Component | Data Source | Replaces |
|---------------|-------------|----------|
| `StoreHeader` | site_settings, categories | New (replaces inline header in page.tsx) |
| `HeroCampaign` | hero_campaigns (via /api/storefront/home) | New |
| `CategoryRail` | categories (via /api/storefront/home) | New |
| `PromoBannerGrid` | promo_banners (via /api/storefront/home) | New |
| `ProductCard` (refactored) | products + product_media (primary image only) | catalog-section.tsx inline card |
| `ProductSection` | products (best sellers via /api/products?bestSeller=true) | catalog-section.tsx |
| `TrustStrip` | trust_items (via /api/storefront/home) | New |
| `CookingGuide` | cooking_steps (via /api/storefront/home) | New |
| `TestimonialPanel` | testimonials (via /api/storefront/home) | New |
| `MarketplacePanel` | marketplace_links + site_settings | New |
| `StoreFooter` | site_settings, marketplace_links | New |
| `NewsletterForm` | POST /api/newsletter | New |
| `MediaGallery` | product_media (via /api/products/:slug) | product-detail.tsx single image |
| `StickyPurchaseCard` | products (price, stock) | New |
| `AdminMediaManager` | product_media (CRUD via /api/admin/products/:id/media) | New |

### Migration Strategy

```
Phase A: Additive schema (no removals)
  → New tables: categories, product_media, product_badges, hero_campaigns,
    promo_banners, trust_items, cooking_steps, testimonials, site_settings,
    marketplace_links, newsletter_subscribers
  → New columns on products: slug, short_description, compare_at_price,
    weight_value, weight_unit, pieces_min, pieces_max, is_featured,
    is_best_seller, is_new, is_promo, rating_average, rating_count,
    sold_count, cooking_instructions, storage_instructions, seo_title,
    seo_description, category_id

Phase B: Backfill
  → categories: unique rows from products.category
  → product_media: primary image from products.image_url
  → products.slug: generated from product name

Phase C: Dual-read transition
  → Catalog queries prefer category_id; fallback to legacy category
  → Product primary image prefers product_media; fallback to products.image_url

Phase D: UI cutover
  → New homepage, product detail, catalog pages use new schema
  → Old pages deprecated but functional

Phase E: Legacy cleanup (after verification)
  → Remove legacy category text column
  → Remove legacy image_url column
  → (Only after production verification)
```

### Feature Priority

| Priority | Features |
|----------|----------|
| **P0 (Must Ship)** | Branding, homepage CMS, categories, enhanced product cards, product detail with media gallery, site settings, banners, testimonials, admin content management, schema migration, commerce regression |
| **P1 (Next Phase)** | Wishlist, coupons, reseller pricing, analytics, newsletter integration, PostgreSQL adapter |

### Gate Review — Phase 1
- [x] Gap analysis complete with priority ranking
- [x] Architecture decisions documented and approved
- [x] ERD v2 validated against all specs
- [x] API contract validated against all specs
- [x] Migration strategy approved (additive-only confirmed)
- [x] Component mapping complete (no orphan components)
- [x] Feature roadmap confirmed with stakeholder

---

## Phase 2 — Database

**Purpose:** Schema, migration, backfill, and seed. No API or UI code.

**Status:** ✅ DONE

### Tasks

| ID | Task | Files |
|----|------|-------|
| 2.1 | **Schema design** — Add all new tables/columns to `db/schema.ts`. Follow Drizzle conventions. | `db/schema.ts` |
| 2.2 | **Generate migration** — Run `npm run db:generate`. Verify SQL is additive-only. | `drizzle/0011_*.sql` |
| 2.3 | **Run migration on clean DB** — Test on fresh SQLite database. Verify no errors. | `data/raf-store.db` |
| 2.4 | **Backfill script** — Create script to: (a) generate categories from unique `products.category` values, (b) generate slugs from product names, (c) backfill `product_media` from `products.image_url`. | `scripts/backfill.mjs` |
| 2.5 | **Seed Jasmine content** — Update `scripts/seed.mjs` with: 10 categories, 6+ frozen food products, hero campaign, promo banners, trust items, cooking steps, testimonials, site settings, marketplace links. | `scripts/seed.mjs` |
| 2.6 | **Verify seed** — Run `npm run db:seed` on clean DB. Verify all tables populated. | Manual check |

### Seed Data (from CONTENT_SEED.md)

| Table | Seed Count |
|-------|------------|
| categories | 10 (Ayam, Beef, Seafood, Dimsum, Bakso, Sosis, Kentang, Snack, Ready Meal, Lainnya) |
| products | 6+ (Chicken Katsu, Chicken Grill Marugame, Cordon Bleu, Nugget Keju, Karage Jepang, Ebi Furai) |
| hero_campaigns | 1 (primary hero) |
| promo_banners | 3 (homepage placement) |
| trust_items | 4 (Kualitas Premium, Rantai Dingin, Kemasan Food Grade, Pengiriman Cepat) |
| cooking_steps | 3 (Keluarkan, Masak, Sajikan) |
| testimonials | 2–3 |
| site_settings | 1 (singleton) |
| marketplace_links | 2–3 (Tokopedia, Shopee, WhatsApp) |

### Gate Review — Phase 2
- [x] `npm run db:generate` produces additive-only migration
- [x] `npm run db:migrate` passes on clean database
- [x] `npm run db:seed` populates all new tables
- [x] Legacy data preserved (existing products, orders, users untouched)
- [x] Schema matches ERD v2 from Phase 1
- [x] Backfill script tested (categories, slugs, product_media)

---

## Phase 3 — Backend APIs

**Purpose:** All API endpoints. No UI work.

**Status:** ✅ DONE

### Tasks

| ID | Task | Endpoint(s) |
|----|------|-------------|
| 3.1 | Media storage adapter | `lib/media-storage.ts` |
| 3.2 | Media CRUD services | `lib/product-media-service.ts` |
| 3.3 | Media API | `app/api/admin/products/[id]/media/` |
| 3.4 | Homepage query service | `lib/queries/homepage.ts` |
| 3.5 | Homepage API | `app/api/storefront/home/route.ts` |
| 3.6 | Catalog query service | `lib/queries/catalog.ts` |
| 3.7 | Catalog API (products + slug) | `app/api/products/` |
| 3.8 | Categories API | `app/api/categories/` |
| 3.9 | CMS APIs (heroes, promos, trust, etc.) | `app/api/admin/*` |
| 3.10 | Newsletter API | `app/api/newsletter/route.ts` |
| 3.11 | Cache tags | `lib/cache.ts` |
| 3.12 | Order prefix RAF → JAS | `lib/order-number.ts` |

### API Endpoint Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/storefront/home` | Assembled homepage DTO | Public |
| GET | `/api/products` | Enhanced catalog (filters, sort, paginate) | Public |
| GET | `/api/products/:slug` | Product detail with media[] | Public |
| GET | `/api/categories` | Active ordered categories | Public |
| POST | `/api/newsletter` | Subscribe email | Public |
| POST | `/api/admin/products/:id/media` | Upload media | Admin |
| PATCH | `/api/admin/products/:id/media/:mediaId` | Update media metadata | Admin |
| PUT | `/api/admin/products/:id/media/reorder` | Reorder media | Admin |
| DELETE | `/api/admin/products/:id/media/:mediaId` | Delete media | Admin |
| GET/POST | `/api/admin/categories` | Categories list/create | Admin |
| PATCH/DELETE | `/api/admin/categories/:id` | Category update/delete | Admin |
| GET/POST | `/api/admin/heroes` | Hero campaigns list/create | Admin |
| PATCH/DELETE | `/api/admin/heroes/:id` | Hero update/delete | Admin |
| GET/POST | `/api/admin/promo-banners` | Promo banners list/create | Admin |
| PATCH/DELETE | `/api/admin/promo-banners/:id` | Promo update/delete | Admin |
| GET/POST | `/api/admin/testimonials` | Testimonials list/create | Admin |
| PATCH/DELETE | `/api/admin/testimonials/:id` | Testimonial update/delete | Admin |
| GET/POST | `/api/admin/trust-items` | Trust items list/create | Admin |
| PATCH/DELETE | `/api/admin/trust-items/:id` | Trust item update/delete | Admin |
| GET/POST | `/api/admin/cooking-steps` | Cooking steps list/create | Admin |
| PATCH/DELETE | `/api/admin/cooking-steps/:id` | Cooking step update/delete | Admin |
| GET/PATCH | `/api/admin/site-settings` | Site settings read/update | Admin |
| GET/POST | `/api/admin/marketplace-links` | Marketplace links list/create | Admin |
| PATCH/DELETE | `/api/admin/marketplace-links/:id` | Marketplace link update/delete | Admin |

### Gate Review — Phase 3
- [x] All public API endpoints return correct DTOs
- [x] All admin API endpoints pass auth check
- [x] Media upload/reorder/delete works end-to-end
- [x] Homepage query assembles all sections without N+1
- [x] Catalog query handles all filter combinations
- [x] `npm run build` passes
- [x] curl/Postman tests pass for all endpoints
- [x] Cache invalidation works on admin mutations

---

## Phase 4 — CMS / Admin

**Purpose:** Admin UI for all content types. Builds on Phase 3 APIs.

**Status:** ✅ DONE

### Tasks

| ID | Task | Admin Route |
|----|------|-------------|
| 4.1 | **Category CRUD** — List, create, edit, reorder, toggle active. Drag-drop sort order. | `/admin/kategori` |
| 4.2 | **Product form enhancement** — Add new fields (slug, compare price, weight, pieces, badges, featured/best seller, cooking/storage, SEO). Add media manager. | `/admin/produk/*` |
| 4.3 | **Hero campaign CRUD** — List, create, edit, publish window, sort order, active toggle. Image upload. | `/admin/hero` |
| 4.4 | **Promo banner CRUD** — List, create, edit, placement, publish window, sort order. Image upload. | `/admin/promo` |
| 4.5 | **Testimonial CRUD** — List, create, edit, rating, sort order, published toggle. Avatar upload. | `/admin/testimonial` |
| 4.6 | **Trust & cooking CRUD** — List, create, edit, sort order, active toggle. Image upload for cooking steps. | `/admin/trust`, `/admin/cara-memasak` |
| 4.7 | **Site settings** — Single form for brand name, tagline, logo, WhatsApp, email, address, hours, free shipping threshold, social URLs. | `/admin/pengaturan` |
| 4.8 | **Marketplace links CRUD** — List, create, edit, sort order, active toggle. Logo upload. | `/admin/marketplace` |
| 4.9 | **Admin shell update** — Add new nav links for all CMS sections. Update branding to Jasmine. | `components/admin-shell.tsx` |
| 4.10 | **Validation & permissions** — Zod schemas for all forms. Confirm admin-only access. Mutation audit logging. | Various |

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

### Gate Review — Phase 4
- [ ] Admin can CRUD all content types (categories, heroes, promos, testimonials, trust, cooking, settings, marketplace)
- [ ] Product form includes all new fields + media manager
- [ ] Media manager: upload, reorder, set primary, edit alt, delete with confirmation
- [ ] All forms show validation feedback
- [ ] Admin-only access enforced on all new endpoints
- [ ] No 500 errors on any admin operation
- [ ] Admin shell updated with new nav links + Jasmine branding

---

## Phase 5 — Frontend Foundation

**Purpose:** Design tokens, shared primitives, layout shell. No page content yet.

**Status:** ✅ DONE

### Tasks

| ID | Task | Files |
|----|------|-------|
| 5.1 | **Design tokens** — Add Jasmine color variables to `globals.css` (--brand-900–50, --accent-500, --cream-50/100, --ink-950/700, --border, --success). | `app/globals.css` |
| 5.2 | **Typography** — Configure heading/body font sizes. H1 48–56px desktop / 34–40px mobile. Body 14–16px. | `app/globals.css`, `tailwind.config` |
| 5.3 | **Shared primitives** — Create `Button`, `Badge`, `Container`, `SectionHeading`, `ProductImageRatio` components. Follow DESIGN_SYSTEM.md. | `components/ui/` |
| 5.4 | **Layout shell** — Responsive container (max 1440px, inner 1280–1360px). Section spacing (8px grid). | `components/ui/container.tsx` |
| 5.5 | **Navbar** — Desktop two-tier header. Mobile compact header with search trigger, account, cart. Category menu. | `components/storefront/header/` |
| 5.6 | **Footer** — Rich footer with site info, marketplace links, newsletter form, social links. Derived from site_settings. | `components/storefront/footer/` |
| 5.7 | **Root layout update** — Update metadata (title, description). Update fonts if needed. | `app/layout.tsx` |
| 5.8 | **Loading/empty states** — Skeleton components matching card dimensions. Empty search state. Image fallback. | `components/ui/skeleton.tsx`, etc. |

### Design Token Values

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

### Gate Review — Phase 5
- [x] All design tokens applied in globals.css
- [x] Shared primitives render correctly at 320/375/768/1024/1440px
- [x] Navbar works on desktop (two-tier) and mobile (compact)
- [x] Footer renders site info, marketplace, newsletter, social
- [x] Root layout metadata updated to Jasmine
- [x] Loading skeletons match card dimensions
- [x] `npm run build` passes
- [x] No Tailwind/TypeScript errors

---

## Phase 6 — Homepage

**Purpose:** Build all homepage sections. Connects to Phase 3 APIs.

**Status:** ✅ DONE

### Tasks

| ID | Task | Component |
|----|------|-----------|
| 6.1 | **Hero campaign** — Image left, headline + CTA right. Metric card (100+ produk, 5000+ reseller, Halal & BPOM). Social proof. Responsive split. | `HeroCampaign` |
| 6.2 | **Category rail** — Horizontal scrollable row with snap. Icon + name per category. Links to /kategori/[slug]. | `CategoryRail` |
| 6.3 | **Promo banner grid** — Three banners. Desktop: 3-col grid. Mobile: stacked. Respect publish window + active state. | `PromoBannerGrid` |
| 6.4 | **Product card refactor** — 4:3 or 1:1 image, badge top-left, name max 2 lines, rating + sold, pack metadata, price + compare price, add-to-cart. | `ProductCard` |
| 6.5 | **Best seller section** — Carousel/grid of featured products. Desktop 5–6 cards, tablet 3, mobile 2. | `ProductSection` |
| 6.6 | **Trust strip** — Four trust items in a row. Icon + title + description. | `TrustStrip` |
| 6.7 | **Cooking guide** — Three steps. Image + title + description. Horizontal on desktop, stacked on mobile. | `CookingGuide` |
| 6.8 | **Testimonials** — Customer quotes with avatar, name, title, rating. Carousel or grid. | `TestimonialPanel` |
| 6.9 | **Marketplace + WhatsApp** — Marketplace logos with links. WhatsApp order button. | `MarketplacePanel` |
| 6.10 | **Newsletter form** — Email input + subscribe button. Success/error feedback. | `NewsletterForm` (in footer) |
| 6.11 | **Visual QA** — Compare against `reference/homepage-locked.png` at 1440px desktop. Check mobile at 375px. | Manual |
| 6.12 | **Responsive + accessibility pass** — Keyboard nav for carousels. Focus rings. Alt text. `prefers-reduced-motion`. | Various |

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

### Gate Review — Phase 6
- [ ] Homepage matches locked reference at 1440px desktop (visual QA needed)
- [ ] Homepage usable at 375px mobile (visual QA needed)
- [x] All sections load data from API (no hardcoded content)
- [x] Hero CTA links work
- [x] Category navigation works
- [x] Promo banners respect publish window
- [x] Product cards show correct price, stock, cart action
- [x] Footer shows site settings data
- [ ] LCP < 2.5s on mobile (needs measurement)
- [ ] CLS < 0.1 (needs measurement)
- [ ] No horizontal overflow at 320px (needs testing)
- [x] `npm run build` passes

---

## Phase 7 — Product Detail

**Purpose:** Enhanced product page with media gallery, video, related products.

**Status:** ✅ DONE

### Tasks

| ID | Task | Component |
|----|------|-----------|
| 7.1 | **Media gallery** — Ordered thumbnail rail (desktop) / swipe carousel (mobile). Main image with 1:1 frame, object-fit contain. | `MediaGallery` |
| 7.2 | **Image zoom/fullscreen** — Hover zoom on desktop. Tap fullscreen on mobile. Modal with prev/next + keyboard arrows. | `MediaGallery` |
| 7.3 | **Video playback** — Play icon + duration on thumbnail. No autoplay with sound. Poster image before playback. Pause on media switch. `preload="metadata"`. | `MediaGallery` |
| 7.4 | **Sticky purchase actions** — Desktop: sticky card on right. Mobile: sticky bottom bar with "Keranjang" + "Beli Sekarang". | `StickyPurchaseCard` |
| 7.5 | **Product info hierarchy** — Breadcrumb, category, badges, name, rating/sold, price/compare, pack details, stock, short description, qty selector, CTAs. | Product detail layout |
| 7.6 | **Content sections** — Description, cooking guide, storage instructions, composition/allergen, shipping info. Tabs on desktop, accordions on mobile. | `ProductDetailSections` |
| 7.7 | **Related products** — Product cards for same category. Exclude current product. | `RelatedProducts` |
| 7.8 | **Catalog page** — `/produk` dedicated listing. Filters (category, price, stock, promo, featured). Sort (relevance, newest, price asc/desc, best selling). Pagination. | `/produk/page.tsx` |
| 7.9 | **Category route** — `/kategori/[slug]` browse page. Same filters as catalog. | `/kategori/[slug]/page.tsx` |
| 7.10 | **SEO** — Product JSON-LD. OpenGraph images. Canonical URLs. | Various |

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

### Gate Review — Phase 7
- [ ] Gallery: thumbnail click changes active media
- [ ] Gallery: mobile swipe works
- [ ] Gallery: fullscreen modal with keyboard nav
- [ ] Video: plays only after user action
- [ ] Video: pauses when switching media
- [ ] Video: poster displayed before playback
- [ ] Catalog cards show only primary image (no video)
- [ ] Sticky purchase bar works on mobile
- [ ] Related products exclude current/inactive
- [ ] /produk page with filters and sort works
- [ ] /kategori/[slug] page works
- [ ] Product JSON-LD present
- [ ] LCP < 2.5s on product detail

---

## Phase 8 — Commerce

**Purpose:** Re-skin cart/checkout/account. Ensure zero regression.

**Status:** ✅ DONE

### Tasks

| ID | Task | Files |
|----|------|-------|
| 8.1 | **Cart re-skin** — Apply new design system to cart page. Product images from product_media. Price display with compare_at_price. | `components/cart-content.tsx`, `app/keranjang/page.tsx` |
| 8.2 | **Checkout re-skin** — Apply new design system to checkout flow. Shipping form, payment selection, proof upload, summary. | `components/checkout-flow.tsx`, `app/checkout/page.tsx` |
| 8.3 | **Account re-skin** — Apply new design system to account profile and order history. | `components/account-page.tsx`, `app/akun/*` |
| 8.4 | **Shipping configurable** — Read shipping cost from site_settings.free_shipping_threshold. Update checkout API. | `app/api/checkout/shipping/route.ts` |
| 8.5 | **Order prefix update** — Change from `RAF-` to `JAS-` in order-number.ts. Verify order number display in admin. | `lib/order-number.ts` |
| 8.6 | **Regression: guest cart** — Add → view → update → remove → checkout. | Manual test |
| 8.7 | **Regression: auth cart** — Login → add → logout → login → cart persists. | Manual test |
| 8.8 | **Regression: checkout** — Complete checkout → order created → stock deducted → cart cleared. | Manual test |
| 8.9 | **Regression: stock** — Rapid double-checkout of last item → exactly one succeeds. | Manual test |
| 8.10 | **Regression: payment proof** — Upload → status → awaiting_verification → admin sees file. | Manual test |
| 8.11 | **Regression: admin orders** — Update payment status → paid auto-sets processing. | Manual test |

### Order Lifecycle

```
paymentStatus:
  pending → awaiting_verification → paid
                                       ↓
                                   failed

orderStatus:
  waiting_payment → processing → shipped → delivered
                       ↑              ↓
                       └────────── cancelled
                   (auto-set when paid)
```

### Gate Review — Phase 8
- [ ] Cart page shows new design with product media images
- [ ] Checkout flow works end-to-end
- [ ] Account pages show new design
- [ ] Shipping cost reads from site_settings
- [ ] Order prefix is `JAS-`
- [ ] Guest cart regression: PASS
- [ ] Auth cart regression: PASS
- [ ] Checkout regression: PASS
- [ ] Stock deduction regression: PASS
- [ ] Payment proof regression: PASS
- [ ] Admin order status regression: PASS
- [ ] `npm run build` passes

---

## Phase 9 — Optimization

**Purpose:** SEO, performance, accessibility, testing, deployment preparation.

**Status:** ✅ DONE

### Tasks

| ID | Task | Details |
|----|------|---------|
| 9.1 | **SEO** — Product JSON-LD with image array. Organization schema from site_settings. OpenGraph tags. Canonical URLs. Sitemap. | Various |
| 9.2 | **Performance** — Lighthouse audit. Image optimization (responsive sizes, modern formats). Lazy loading for non-primary images. Video preload="metadata". Cache headers. | Various |
| 9.3 | **Accessibility** — WCAG AA contrast. Keyboard nav for carousels/menus. Focus rings. Alt text. `aria-label` for icon buttons. `prefers-reduced-motion`. | Various |
| 9.4 | **Responsive QA** — Test at 320px, 375px, 768px, 1024px, 1440px. No horizontal overflow. Readable text. Usable touch targets. | Manual |
| 9.5 | **Lint & build** — `npm run lint` passes. `npm run build` passes. No TypeScript errors. | CI |
| 9.6 | **Testing** — Add test framework if absent. Unit tests for critical services (stock deduction, cart, order creation). E2E smoke plan. | `__tests__/`, `e2e/` |
| 9.7 | **Migration rehearsal** — Test full migration on copy of production DB. Verify row counts, totals, stock, order snapshots. | Scripts |
| 9.8 | **Rollback test** — Verify pre-migration backup can restore. Test feature flag `STOREFRONT_V2_ENABLED` if used. | Scripts |
| 9.9 | **Deployment checklist** — Document env vars, migration steps, seed steps, verification steps. | `DEPLOYMENT.md` |

### Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| Homepage LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| Product detail LCP | < 2.5s | Lighthouse |
| Search results visible | < 500ms after server response | Manual |
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

### Gate Review — Phase 9
- [ ] Lighthouse score > 90 (performance, accessibility, best practices, SEO)
- [ ] No critical accessibility issues
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Responsive QA at all breakpoints
- [ ] Migration rehearsal on production-like data
- [ ] Rollback tested
- [ ] Deployment checklist complete
- [ ] Zero regression on commerce flows

---

## Summary — Phase Dependencies

```
P0 (Audit) ──→ P1 (Design) ──→ P2 (Database) ──→ P3 (Backend APIs)
                                                      │
                                                      ├──→ P4 (CMS/Admin)
                                                      │
                                                      └──→ P5 (Frontend Foundation) ──→ P6 (Homepage) ──→ P7 (Product Detail) ──→ P8 (Commerce) ──→ P9 (Optimization)
```

**Parallel tracks possible:**
- P4 (CMS/Admin) and P5 (Frontend Foundation) can run in parallel after P3 completes
- P6 (Homepage) depends on P5 (Frontend Foundation)
- P7 (Product Detail) depends on P6 (Homepage) for shared components
- P8 (Commerce) depends on P7 (Product Detail) for cart integration
- P9 (Optimization) is the final phase after all features land

---

*This roadmap is the authoritative execution plan. All task assignments must reference the phase and task ID from this document.*
