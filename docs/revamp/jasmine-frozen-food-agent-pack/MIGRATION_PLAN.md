# Migration Plan — Raf Store to Jasmine Frozen Food

## Principle
In-place controlled migration with rollback, not destructive rewrite.

## Phase A — Snapshot and audit
- Create branch `revamp/jasmine-frozen-food`.
- Backup SQLite database and uploaded proof/media directories.
- Record current routes, seed credentials, cart/order smoke tests.
- Screenshot existing customer and admin pages.

## Phase B — Additive schema
- Add new tables/columns without removing legacy fields.
- Run migration on copy of real data.
- Backfill product slugs and categories deterministically.
- Seed Jasmine content.

## Phase C — Dual-read transition
- Catalog queries prefer `category_id`; fallback to legacy category.
- Product primary image prefers `product_images`; fallback to `products.imageUrl`.
- Existing admin remains functional while new content admin is built.

## Phase D — UI cutover
- Replace header/home/footer first.
- Cut product cards and detail.
- Re-skin cart/checkout/account/admin shell.
- Keep old route contracts through adapters where possible.

## Phase E — Production database option
Recommended production target PostgreSQL:
- Introduce env-driven DB adapter.
- Create PostgreSQL Drizzle schema equivalent.
- Build one-time export/import script.
- Verify row counts, totals, stock, order snapshots.
SQLite remains local/test until deployment decision is confirmed.

## Rollback
- Keep pre-migration DB backup.
- Migrations additive until stable release.
- Feature flag `STOREFRONT_V2_ENABLED` may switch homepage during staged rollout.
- Never rollback by manually editing production DB; use migration/release rollback procedure.
