# API Contract

Use existing route style where possible. JSON envelope:
```json
{ "data": {}, "error": null, "meta": {} }
```
Errors:
```json
{ "data": null, "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": {} } }
```

## Public
### GET `/api/storefront/home`
Returns assembled homepage DTO.

### GET `/api/products`
Query: `q, category, featured, bestSeller, promo, sort, minPrice, maxPrice, inStock, page, limit`.

### GET `/api/products/:slug`
Product detail, ordered `media[]` collection with image/video items, category, badges, related products.

### GET `/api/categories`
Active ordered categories.

### POST `/api/newsletter`
Body `{ email, source }`; idempotent for same email.

## Admin product media
- `POST /api/admin/products/:id/media` multipart upload; returns created media metadata.
- `PATCH /api/admin/products/:id/media/:mediaId` updates alt text, title, primary state and metadata allowed by policy.
- `PUT /api/admin/products/:id/media/reorder` body `{ "orderedIds": ["..."] }`.
- `DELETE /api/admin/products/:id/media/:mediaId` removes metadata and schedules physical-file cleanup.

Upload responses must expose per-file validation errors. The implementation may use server actions instead of REST only when the repository already standardizes on server actions; keep the same domain contract.

## Admin content
- `/api/admin/categories` GET/POST
- `/api/admin/categories/:id` PATCH/DELETE
- `/api/admin/heroes` GET/POST
- `/api/admin/heroes/:id` PATCH/DELETE
- `/api/admin/promo-banners` GET/POST
- `/api/admin/promo-banners/:id` PATCH/DELETE
- `/api/admin/testimonials` GET/POST
- `/api/admin/testimonials/:id` PATCH/DELETE
- `/api/admin/trust-items` and `/cooking-steps`
- `/api/admin/site-settings` GET/PATCH
- `/api/admin/marketplace-links` CRUD

## Validation examples
Product:
- name 2–120 chars
- slug lowercase kebab case
- price integer >= 0
- compareAtPrice null or > price
- stock integer >= 0
- image/video URL valid path/URL according to storage policy
- image <= configured image limit; video <= configured video limit
- media type must match detected MIME type
- product detail media ordering contains unique IDs owned by that product

## Status codes
- 200 read/update
- 201 create
- 204 delete where no body
- 400 validation
- 401 unauthenticated
- 403 non-admin
- 404 missing
- 409 duplicate slug/SKU or business conflict
- 422 stock/business rule failure
