# Implementation Order

## Phase 0 — Audit
- Map current routes, components, schema, services, API, auth and admin.
- Produce `docs/revamp/current-state-audit.md` inside repository.

## Phase 1 — Foundation
- Brand assets and design tokens.
- Shared container, button, badge, section heading, image ratio primitives.
- Site settings read model.

## Phase 2 — Homepage frontend
- Header + navigation.
- Hero.
- Categories.
- Promo banners.
- Product card/section.
- Trust, cooking, testimonials, marketplace, footer.
- Responsive and accessibility pass.

Initially may use typed fixtures matching final DTO, but must replace fixtures in Phase 4.

## Phase 3 — Catalog/product UX
- `/produk`, filters/sort/search.
- Category route.
- Enhanced detail page with multi-image/video gallery, media zoom/fullscreen, sticky purchase actions and related products.
- Re-skin cart/account/checkout.

## Phase 4 — Backend/schema/admin CMS
- Additive migration including unified `product_media`.
- Storage adapter and secure product media upload pipeline.
- Seed/backfill.
- Repositories/services/API.
- Admin content management.
- Connect homepage to live DB.

## Phase 5 — Commerce hardening
- Order item snapshots.
- Stock transaction checks.
- Promo consistency.
- Payment proof regression.

## Phase 6 — Quality and release
- Unit/service tests where framework exists; add focused tests if absent.
- E2E smoke plan.
- Lighthouse/accessibility/image optimization.
- Production migration rehearsal and release checklist.
