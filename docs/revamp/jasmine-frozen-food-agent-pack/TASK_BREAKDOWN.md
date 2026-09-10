# Executable Task Breakdown

Each task must be independently verifiable.

## P0 Audit
- A01 inventory routes and page responsibilities.
- A02 inventory schema and migration history.
- A03 map cart/order/stock transaction path.
- A04 identify auth/admin guards.
- A05 document current regressions before change.

## P1 Foundation
- F01 add Jasmine token variables to `globals.css`.
- F02 add brand/logo asset slots and metadata.
- F03 create storefront shared primitives.
- F04 create typed homepage DTO and fixture.
- F05 create responsive container and section conventions.

## P2 Homepage
- H01 build desktop/mobile header.
- H02 build hero with metric card and CTA.
- H03 build category rail.
- H04 build promo banner grid.
- H05 refactor product card.
- H06 build best-seller section.
- H07 build trust strip.
- H08 build cooking guide.
- H09 build testimonials.
- H10 build marketplace/WhatsApp panel.
- H11 build footer/newsletter form.
- H12 visual QA against locked reference.

## P3 Catalog/detail
- C01 add `/produk` page.
- C02 server-side filters and sorting.
- C03 category route.
- C04 build product media gallery with ordered thumbnails, mobile swipe, zoom/fullscreen and video playback.
- C04a build sticky desktop/mobile purchase actions.
- C04b implement accessible video poster, controls and pause-on-switch behavior.
- C04c add product badges/pack metadata.
- C05 cooking/storage and related products.
- C06 preserve cart integration.

## P4 Data/backend
- B01 design additive Drizzle schema.
- B02 generate migration.
- B03 backfill category/slug script.
- B04 seed Jasmine content and products.
- B04a add `product_media` migration and legacy image backfill.
- B04b implement media storage adapter.
- B04c implement secure image/video upload, reorder, set-primary and delete services.
- B05 homepage query service.
- B06 catalog query service.
- B07 product detail query.
- B08 public APIs or server actions.
- B09 cache tags and invalidation.

## P5 Admin
- M01 category CRUD/reorder.
- M02 product form enhancement including drag-drop media manager, upload progress, preview, reorder, alt text, primary selection and delete confirmation.
- M03 hero campaign CRUD.
- M04 promo banner CRUD.
- M05 testimonial/trust/cooking CRUD.
- M06 settings/marketplace CRUD.
- M07 validation, permissions, mutation audit.

## P6 Commerce regression
- R01 guest cart.
- R02 authenticated cart/account.
- R03 checkout transfer.
- R04 order creation and stock movement.
- R05 payment proof upload.
- R06 admin order status update.

## P7 Release
- Q01 lint/build.
- Q02 responsive 320/375/768/1024/1440.
- Q03 keyboard/accessibility.
- Q04 SEO structured data.
- Q05 performance/image optimization.
- Q06 migration rehearsal + rollback test.
