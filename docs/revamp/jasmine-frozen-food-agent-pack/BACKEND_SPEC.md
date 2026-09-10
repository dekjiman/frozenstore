# Backend Specification

## Functional domains
1. Catalog: products, categories, ordered product media (image/video), merchandising flags.
2. Content: hero campaigns, promo banners, trust items, cooking steps, testimonials.
3. Commerce existing: carts, users, orders, order items, payment settings/proofs.
4. Inventory existing: stock movements and current stock.
5. Settings: brand/contact/social/marketplace/shipping thresholds.

## Public query requirements
### Homepage query
Return one assembled view model:
- site settings
- active primary hero
- ordered active categories
- active promo banners
- best sellers/featured products
- trust items
- cooking steps
- published testimonials
- marketplace links

Avoid N+1. Query product media in batch or join.

### Catalog query
Inputs: `q`, `category`, `promo`, `featured`, `sort`, `minPrice`, `maxPrice`, `inStock`, `page`, `limit`.
Server validates allowed sort and caps limit.

## Product media service
- Store media metadata in DB and binary files in a storage adapter, never DB blobs.
- Enforce one primary image per product.
- Validate MIME type, file size, product ownership and media limits.
- Reordering must run in a transaction.
- Deleting a media row should remove the physical file after successful DB mutation, with retry/cleanup for storage failure.
- Catalog queries select only the primary image; product detail returns the complete ordered media collection.
- Video URLs must not be included in homepage/list payloads unless explicitly requested.

## Admin mutations
- Require authenticated admin.
- Validate with explicit schema (Zod recommended; add dependency if not present).
- Slugs unique and normalized.
- Sort order integer.
- Publish windows validated (`startsAt < endsAt`).
- Delete strategy: soft delete where history/reference matters.

## Commerce safeguards
- Product price and name snapshot saved on order item.
- Checkout revalidates stock and active state.
- Stock update and order creation in transaction.
- Promotion display does not silently alter checkout totals unless a promotion engine is implemented.

## Observability
- Structured server logs for admin mutations and checkout failures.
- Do not log passwords, session secrets, proof binary, or personal address payloads in full.
