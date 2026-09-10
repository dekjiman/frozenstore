# Architecture

## Current baseline
Monolithic full-stack Next.js App Router. UI, route handlers/server actions, business logic, and SQLite/Drizzle live in one repository.

## Target architecture
```text
Browser
  ├─ Storefront Server Components
  ├─ Interactive Client Islands (search, carousel, cart)
  └─ Admin Client Forms
          ↓
Next.js Application Layer
  ├─ Route handlers / server actions
  ├─ Validation + authorization
  ├─ Storefront queries
  ├─ Catalog service
  ├─ Content service
  ├─ Cart/order/stock services existing
  └─ Media abstraction
          ↓
Repository/Data Layer
  ├─ Drizzle repositories
  ├─ SQLite adapter (local/default)
  └─ PostgreSQL adapter (production target)
          ↓
Database + image storage
```

## Recommended source organization
```text
components/
  storefront/
    header/
    hero/
    categories/
    promotions/
    product-card/
    trust/
    cooking-guide/
    testimonials/
    footer/
  admin/content/
lib/
  validation/
  services/
  repositories/
  queries/
  format/
  constants/
app/
  api/
  admin/content/
```

## Data access rules
- Pages do not perform raw ad-hoc SQL.
- Queries are centralized under `lib/queries` or repositories.
- Business mutations happen in services/route handlers/server actions.
- Transaction required for checkout, order item creation, stock movement, and stock deduction.
- Public endpoints return only active/published records.

## Caching
- Home content: `revalidate` 60–300 seconds or tag-based invalidation.
- Product detail/catalog: tag by product/category.
- Cart/account/order: dynamic/no-store.
- Admin mutation invalidates affected tags.

## Image strategy
- Use `next/image`.
- Store image URL + alt text + width/height where practical.
- Hero uses responsive `sizes`, priority only for first visible hero.
- Product card images should use fixed aspect ratio to avoid CLS.
