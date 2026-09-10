# Frontend Specification

## Homepage component map
```text
app/page.tsx
  StoreHeader
  HeroCampaign
  CategoryRail
  PromoBannerGrid
  ProductSection(best-seller)
  TrustStrip
  CookingGuide
  TestimonialPanel
  MarketplacePanel
  StoreFooter
```

## Responsive behavior
### Desktop ≥ 1200
- Two-tier header.
- Hero content left, food image right, floating metric card.
- Category rail one row.
- Three promo banners.
- Product carousel/grid 5–6 cards.

### Tablet 768–1199
- Header search remains prominent; secondary links collapse.
- Hero 55/45 split or stacked at narrow tablet.
- Promo grid 2+1.
- Product grid 3 cards.

### Mobile < 768
- Compact header: logo, search trigger/full-width search, account/cart.
- Hero stacks text above image; metrics become horizontal chips.
- Category rail horizontally scrollable with snap.
- Promo banners stacked.
- Product cards 2 columns; add-to-cart button remains usable.
- Sticky mobile cart/checkout CTA only where contextually needed.

## Page routes
- `/` home
- `/produk` all products (add if absent; existing homepage catalog must be separated)
- `/produk/[id-or-slug]` with multi-image/video gallery, zoom/fullscreen, and responsive purchase panel
- `/kategori/[slug]`
- `/promo`
- `/cara-memasak`
- `/reseller`
- existing `/keranjang`, `/checkout`, `/akun`, `/masuk`, `/daftar`, `/admin/*`

## Product detail media UI
- Use an ordered thumbnail gallery on desktop and swipe carousel on mobile.
- Support image and MP4 video media items.
- Primary media is loaded eagerly; other images lazy-load and video uses metadata preload.
- Pause video when switching media.
- Product card/list must only render primary image, never product video.
- Implement fullscreen media viewer with keyboard and touch navigation.
- Sticky mobile action bar contains `Keranjang` and `Beli Sekarang`.
- Follow `PRODUCT_DETAIL_MEDIA_SPEC.md` as the authoritative detail-page contract.

## Loading/error/empty states
- Skeleton matching card dimensions.
- Friendly empty search with reset filter.
- Image fallback preserving ratio.
- Section hidden only when no published content, except critical trust/contact fallback.

## SEO
- Metadata brand title/description.
- Product JSON-LD for product detail.
- Organization schema with contact/social.
- Canonical URLs and OpenGraph images.

## Frontend migration notes
- Refactor current `catalog-section.tsx`; do not keep homepage as one oversized component.
- Preserve cart provider contract; product card should call existing cart API/provider through a thin adapter.
- Replace global one-off CSS with tokens/utilities and component-local class composition.
