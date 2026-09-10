# Acceptance Tests

## Homepage
- Jasmine logo and red theme visible; no Raf Store customer branding remains.
- Hero data loads from DB and CTA links work.
- Categories navigate/filter correctly.
- Promo banners respect active state and publish window.
- Best-seller products show correct price, pack info, stock state and cart action.
- Footer contact/marketplace data comes from settings.

## Responsive
- No horizontal page overflow at 320px.
- Header/cart/search usable at 375px.
- Product cards remain readable in 2-column mobile grid.
- Desktop visually follows locked reference at 1440px.

## Catalog
- Search is case-insensitive and returns expected products.
- Category + price + stock filters combine correctly.
- Invalid sort/filter input is rejected or normalized safely.
- Pagination has stable ordering.

## Product detail
- Product supports at least 5 ordered images and 1 MP4 video.
- Desktop thumbnail click and mobile swipe change the active media.
- Image fullscreen/zoom works without aspect-ratio distortion.
- Video plays only after user action, uses poster, and pauses when active media changes.
- Catalog and homepage load only the primary image, not video media.
- Admin can upload, reorder, set primary, edit alt text and delete media.
- Invalid MIME, oversized file and media owned by another product are rejected.
- Missing image uses fallback.
- Out-of-stock product cannot be added beyond available stock.
- Compare price only appears when valid.
- Related products exclude current/inactive product.

## Admin/security
- Customer cannot access admin APIs.
- Duplicate SKU/slug returns conflict.
- Unpublished content is not visible publicly.
- All update forms show validation feedback.

## Commerce regression
- Guest cart persists according to current session contract.
- Checkout revalidates price and stock.
- Successful order creates items and stock movement atomically.
- Failed transaction does not partially deduct stock.
- Payment proof and order tracking still work.

## Build
```bash
npm install
npm run db:migrate
npm run db:seed
npm run lint
npm run build
```
All commands must finish successfully on a clean environment.
