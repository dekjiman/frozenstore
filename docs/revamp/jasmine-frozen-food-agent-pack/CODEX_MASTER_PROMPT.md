# Master Prompt for Codex / Coding Agent

Anda bekerja pada repository turunan `https://github.com/rafiulm/raf-store`.

Tujuan: revamp menjadi Jasmine Frozen Food menggunakan desain locked `reference/homepage-locked.png`. Baca seluruh dokumen dalam pack ini dan ikuti `IMPLEMENTATION_ORDER.md` serta `TASK_BREAKDOWN.md`.

Instruksi:
1. Audit codebase aktual; jangan hanya mengandalkan asumsi dokumen.
2. Pertahankan Next.js App Router, React, TypeScript, Tailwind, Drizzle dan fitur commerce existing.
3. Implementasikan perubahan bertahap, frontend-first tetapi DTO harus sesuai target backend.
4. Backend harus diperluas agar homepage, kategori, promo, testimonial, trust, cooking guide, marketplace, dan settings data-driven.
5. Semua perubahan schema wajib migration + seed + backfill aman.
6. Jangan menghapus legacy field sampai dual-read dan verifikasi selesai.
7. Jalankan lint/build setelah setiap fase utama.
8. Berhenti pada checkpoint di `AGENT_EXECUTION_RULES.md` dan laporkan hasil.

Mulai dari Phase 0 Audit. Buat `docs/revamp/current-state-audit.md`, lalu lanjutkan Phase 1 hanya setelah audit selesai.


Product detail implementation must follow `PRODUCT_DETAIL_MEDIA_SPEC.md`, including unified image/video media data, secure uploads, responsive gallery, and commerce regression safeguards.
