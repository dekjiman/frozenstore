# AI Agent Execution Rules

## Misi
Ubah codebase Raf Store menjadi Jasmine Frozen Food dengan desain locked di `reference/homepage-locked.png`, sambil mempertahankan fitur transaksi existing dan memperluas backend agar storefront sepenuhnya data-driven.

## Aturan keras
- Audit file existing sebelum mengubahnya. Jangan menebak struktur.
- Jangan menghapus fitur cart, checkout, auth, order tracking, stock, atau admin existing.
- Hindari rewrite massal satu langkah. Kerjakan fase dan task secara berurutan.
- Jangan menambah library UI besar tanpa kebutuhan nyata. Gunakan Tailwind dan `lucide-react` existing.
- Server Component sebagai default; gunakan Client Component hanya untuk interaksi.
- Semua operasi mutasi harus memiliki validasi server-side dan otorisasi admin bila perlu.
- Harga disimpan sebagai integer rupiah.
- Stok tidak boleh negatif.
- Jangan hard-code data bisnis yang seharusnya dapat dikelola admin.
- Jangan membaca atau menulis `.env` ke dokumentasi/log.
- Setiap perubahan schema wajib disertai migration dan seed update.

## Workflow setiap task
1. Baca task dan file terkait.
2. Catat risiko regresi.
3. Implementasi paling kecil yang lengkap.
4. Jalankan typecheck/lint/build atau test yang relevan.
5. Perbaiki error sebelum pindah task.
6. Laporkan file berubah, keputusan, dan hasil verifikasi.

## Referensi wajib
- `IMPLEMENTATION_BLUEPRINT.md` — **MASTER EXECUTION PLAN.** Baca ini pertama.
- `BUSINESS_RULES.md` — Seluruh aturan bisnis. Jangan langgar.
- `CMS_SPEC.md` — Apa yang admin bisa ubah tanpa deploy.
- `MEDIA_ARCHITECTURE.md` — Standar gambar dan video.

## Checkpoint wajib (per phase gate review)
Berhenti dan minta verifikasi manusia setelah setiap phase:
- **P0:** Audit selesai → `current-state-audit.md` lengkap.
- **P1:** Design & planning selesai → ERD v2, API redesign, migration strategy disetujui.
- **P2:** Database selesai → schema, migration, seed terverifikasi.
- **P3:** Backend APIs selesai → semua endpoint return DTO benar.
- **P4:** CMS/Admin selesai → admin bisa CRUD semua konten type.
- **P5:** Frontend foundation selesai → design system, navbar, footer terrender.
- **P6:** Homepage selesai → visual QA vs locked reference.
- **P7:** Product detail selesai → gallery, video, related products works.
- **P8:** Commerce selesai → regression tests pass.
- **P9:** Optimization selesai → Lighthouse > 90, a11y clean, build pass.

## File yang kemungkinan besar terdampak
- `app/page.tsx`, `app/globals.css`, `app/layout.tsx`
- `components/catalog-section.tsx`, `catalog-search.tsx`, `cart-button.tsx`, `product-detail.tsx`
- komponen baru di `components/storefront/*`
- komponen baru di `components/ui/*` (shared primitives)
- komponen baru di `components/admin/content/*` (CMS panels)
- `db/schema.ts`, migrations (`drizzle/0011_*.sql`+), `scripts/seed.mjs`
- service/repository di `lib/*` (queries, services, media-storage)
- route handlers di `app/api/*` (public + admin)
- admin pages/components di `app/admin/*`
