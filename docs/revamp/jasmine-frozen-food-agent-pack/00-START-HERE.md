# Jasmine Frozen Food — AI Agent Execution Pack

## Tujuan
Dokumen ini adalah sumber kebenaran untuk merevamp repository `rafiulm/raf-store` menjadi **Jasmine Frozen Food**, berdasarkan desain homepage merah-krem yang sudah dikunci pada `reference/homepage-locked.png`.

## Baseline repository
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Drizzle ORM
- SQLite (`better-sqlite3`)
- Storefront, cart persisten, checkout transfer manual, akun pelanggan, pelacakan pesanan, admin produk/order/stok.

## Keputusan arsitektur
1. **Tidak rewrite dari nol.** Pertahankan Next.js full-stack dan pola App Router.
2. Revamp dilakukan vertikal: UI storefront → model data → API/service → admin CMS → migrasi data → pengujian.
3. SQLite tetap didukung untuk local development. Untuk production, siapkan adapter PostgreSQL sebagai target deployment tanpa memblokir fase UI.
4. Semua konten homepage harus dikelola dari admin atau seed, bukan hard-coded permanen.
5. Desain locked adalah acuan visual, tetapi implementasi wajib responsif, accessible, dan data-driven.

## Urutan membaca untuk AI agent

### PRIMARY (baca ini duluan — single source of truth)
1. `IMPLEMENTATION_BLUEPRINT.md` — **MASTER EXECUTION PLAN.** Semua task, phases, gate reviews, business rules quick reference. Baca ini pertama.
2. `AGENT_EXECUTION_RULES.md` — Aturan keras dan workflow
3. `current-state-audit.md` — Baseline kode existing (Phase 0 deliverable)

### Business & Rules
4. `PRD.md` — Product vision, scope, success metrics
5. `BUSINESS_RULES.md` — Seluruh aturan bisnis (stok, promo, best seller, media, pengiriman)
6. `CMS_SPEC.md` — Apa saja yang dapat diubah admin tanpa deploy ulang

### Architecture & Data
7. `ARCHITECTURE.md` — Arsitektur target dan source organization
8. `DATABASE_SCHEMA.md` — Schema changes dan migration plan
9. `API_CONTRACT.md` — Endpoint contracts dan validation
10. `MEDIA_ARCHITECTURE.md` — Standar pengelolaan gambar dan video

### Design & Frontend
11. `DESIGN_SYSTEM.md` — Color tokens, typography, layout, motion
12. `FRONTEND_SPEC.md` — Component map, responsive behavior, routes
13. `PRODUCT_DETAIL_MEDIA_SPEC.md` — Product detail & media gallery spec

### Implementation
14. `BACKEND_SPEC.md` — Functional domains, query requirements, safeguards
15. `MIGRATION_PLAN.md` — Migration phases A–E
16. `TASK_BREAKDOWN.md` — Executable task list (legacy, refer to IMPLEMENTATION_BLUEPRINT)
17. `CONTENT_SEED.md` — Initial seed data
18. `ACCEPTANCE_TESTS.md` — Acceptance criteria

## Definition of Done global
- Branding Raf Store hilang dari customer-facing UI.
- Homepage sesuai reference pada desktop dan tetap usable pada mobile.
- Product, category, promo, banner, testimonial, trust badge, cooking guide, marketplace, dan site settings berasal dari database.
- Admin dapat mengelola konten utama tanpa edit source code.
- Existing cart, checkout, account, order, stock, dan payment proof tetap berfungsi.
- `npm run lint` dan `npm run build` lulus.
- Migration dan seed dapat dijalankan pada database kosong.
