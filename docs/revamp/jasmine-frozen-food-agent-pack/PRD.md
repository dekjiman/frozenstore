# Production PRD — Jasmine Frozen Food Store Revamp

## 1. Product vision
Jasmine Frozen Food adalah storefront frozen food premium yang menjual produk praktis untuk keluarga, reseller, UMKM, dan horeca. Pengalaman harus terasa seperti brand retail makanan yang matang, bukan template katalog generik.

**Positioning:** “Frozen Food Premium, Praktis Seperti Masakan Restoran.”

## 2. Target pengguna
- Keluarga yang mencari stok makanan praktis.
- Pembeli repeat-order yang butuh pencarian cepat.
- Reseller/UMKM yang membeli lebih banyak.
- Admin operasional yang mengelola katalog, promo, stok, pesanan, dan konten homepage.

## 3. Goals
- Meningkatkan kejelasan brand dan trust.
- Mempercepat discovery produk berdasarkan kategori dan promo.
- Meningkatkan add-to-cart dari homepage.
- Mengubah homepage menjadi CMS-driven.
- Menjaga seluruh fungsi transaksi existing.

## 4. Non-goals fase ini
- Marketplace multi-vendor.
- Payment gateway otomatis.
- Loyalty points kompleks.
- Multi-warehouse penuh.
- Native mobile app.

## 5. Scope storefront
### Header
Logo Jasmine, category menu, search global, promo, bantuan, akun, cart badge, secondary nav.

### Homepage
1. Hero campaign dengan gambar, headline, CTA, social proof.
2. Category quick navigation.
3. Tiga promo banners.
4. Best seller/product carousel.
5. Trust strip.
6. Cooking guide tiga langkah.
7. Testimonial.
8. Marketplace + WhatsApp ordering.
9. Rich footer dan newsletter.

### Product listing/search
- Query, category, promo, best seller, newest, price range, stock availability.
- Sorting: relevance/default, newest, price asc/desc, best selling.

### Product detail
- Marketplace-style media gallery: multiple images, one or more controlled product videos, thumbnails, zoom/fullscreen, and swipe carousel on mobile.
- Weight/pack info, serving/pcs, badges, price/promo, stock, cooking instructions, storage instructions, related products.
- Sticky purchase action on mobile and optional sticky purchase card on desktop.
- Detailed implementation rules are defined in `PRODUCT_DETAIL_MEDIA_SPEC.md`.

### Cart/checkout/account
Pertahankan existing flow; re-skin ke design system baru dan pastikan data promo/discount snapshot konsisten.

## 6. Scope admin/backend
- Category CRUD + ordering + active state.
- Product enhancement: slug, compare price, weight, unit, pieces, badges, featured/best seller, cooking/storage content, image gallery.
- Homepage campaign/hero CRUD.
- Promo banner CRUD.
- Testimonial CRUD.
- Trust badge and cooking step CRUD.
- Site settings: contact, WhatsApp, social, marketplace links, operational hours, free-shipping threshold.
- Basic coupon/promotion rules optional phase 2; visual promo can ship without checkout coupon engine.

## 7. Success metrics
- Homepage LCP target < 2.5s on production-like mobile connection.
- CLS < 0.1.
- Search results visible within 500ms after server response; debounced UI.
- Zero regression on add-to-cart, checkout, order creation, stock deduction, payment proof.
- 100% homepage sections editable through DB/seed; admin UI for all P0 sections.

## 8. P0 / P1
### P0
Branding, homepage, categories, enhanced product cards, product detail, site settings, banners, testimonials, admin content, schema migration, regression.

### P1
Wishlist, coupons, reseller pricing, richer analytics, newsletter integration, PostgreSQL deployment adapter.
