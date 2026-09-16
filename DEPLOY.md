# Panduan Deploy — Jasmine Frozen Food (frozenstore)

Stack: Next.js 16 (standalone) + Postgres 16, dijalankan dengan Docker Compose.
Server produksi: `103.216.188.140` — direktori deploy `/opt/jasminefood` (git clone dari `origin/main`).

## Ringkasan arsitektur

| Hal | Lokasi / perilaku |
| --- | --- |
| Kode | Repo git `origin/main`. Server clone di `/opt/jasminefood`. |
| Image | `jasminefood-app:latest` — `NEXT_PUBLIC_BASE_URL` & `BASE_URL` adalah **build arg** dari `.env`. |
| DB | Container `jasminefood-db-1` (Postgres), volume `pgdata`, port host `127.0.0.1:5433`. |
| Uploads | Volume `jasminefood_uploads_data` → `/app/public/uploads`. **Tidak di-commit ke git.** |
| Env | `/opt/jasminefood/.env` — **gitignored**, edit langsung di server. |
| Migrasi DB | Drizzle. File SQL di `drizzle/` (commit). Terapkan dengan `db:migrate` (dicatat di `__drizzle_migrations`). |

---

## 1. Deploy normal (perubahan kode)

1. **Lokal** — develop & validasi:
   ```bash
   npm run lint
   npm run build          # atau test dulu di dev: docker compose -f docker-compose.dev.yml up
   ```
2. **Commit + push** ke `origin/main`.
3. **Server**:
   ```bash
   cd /opt/jasminefood
   ./scripts/deploy.sh    # = pull --ff-only + up -d --build app + kesehatan
   ```
   Atau manual:
   ```bash
   git -C /opt/jasminefood pull --ff-only origin main
   cd /opt/jasminefood && docker compose up -d --build app
   ```
   `--build` **wajib** untuk `NEXT_PUBLIC_*` (build arg; dibaca `.env` saat `next build`).
4. **Verifikasi**: `docker compose ps`, lalu buka `http://103.216.188.140:8090/`.
   ISR (home & halaman produk) otomatis segar ≤ 60 detik — tidak perlu restart manual.

> Catatan: jika `git pull` gagal karena ada file lokal yang berubah, samakan dulu
> (mis. `git checkout -- <file>` setelah yakin isinya sama dengan origin, atau stash).

## 2. Perubahan env (`.env` server)

`/opt/jasminefood/.env` tidak ikut git. Setelah diedit:

- Hanya var **runtime** (`EVOLUTION_*`, `GOOGLE_*`, `CART_SESSION_SECRET`): cukup recreate
  ```bash
  cd /opt/jasminefood && docker compose up -d app
  ```
- Ada var **`NEXT_PUBLIC_*`**: butuh rebuild
  ```bash
  cd /opt/jasminefood && docker compose up -d --build app
  ```

## 3. Perubahan skema DB (Drizzle)

1. **Lokal**: ubah skema → generate & commit:
   ```bash
   npm run db:generate     # menghasilkan file .sql baru di drizzle/
   git add drizzle && git commit && git push
   ```
2. **Server**: buka SSH tunnel lalu jalankan drizzle (agar tercatat di `__drizzle_migrations`):
   ```bash
   ssh -L 5433:127.0.0.1:5433 root@103.216.188.140   # terminal terpisah
   # lalu di mesin lokal (repo bersih, di pusat yang sama dengan drizzle.config.ts):
   DATABASE_URL=postgresql://frozenstore:frozenstore@127.0.0.1:5433/frozenstore npm run db:migrate
   ```
   > Jangan eksekusi SQL migrasi manual via psql tanpa mencatat hash-nya di
   > `__drizzle_migrations`, nanti `db:migrate` (jauh) akan run ulang.

## 4. Konten CMS & uploads (bukan deploy)

- Semua edit lewat admin (produk, promosi, settings, upload gambar) tersimpan langsung di
  volume DB/uploads — **tanpa deploy**. File upload baru langsung tampil karena route
  `app/uploads/[...path]/route.ts` (streaming, tak perlu restart).
- Sinkron dev ↔ prod (mis. sekali-sekali biar identik):
  - DB: `pg_dump -Fc` dari sumber → restore ke tujuan (seperti sesi melewatkan).
  - Uploads: `tar czf` di container → pindahkan → `tar xzf` di tujuan.

## 5. Backup & rollback

- Backup DB (sebelum operasi berisiko, mis. restore/sync):
  ```bash
  mkdir -p /opt/jasminefood/backups
  docker exec jasminefood-db-1 pg_dump -U frozenstore -d frozenstore -Fc -f /tmp/backup.dump
  docker cp jasminefood-db-1:/tmp/backup.dump /opt/jasminefood/backups/backup-$(date +%F).dump
  ```
- Rollback kode: `git -C /opt/jasminefood checkout <commit>` lalu rebuild + restart.
- Rollback DB: `pg_restore` dari `backups/*.dump` (drop & recreate DB dahulu).

## Checklist cepat sebelum deploy produksi

- [ ] `npm run lint` lulus
- [ ] Perilaku di dev (`localhost:3000`) sudah sesuai
- [ ] Server `git pull --ff-only origin main` sukses
- [ ] `docker compose up -d --build app` sukses; `docker compose ps` sehat
- [ ] `http://103.216.188.140:8090/` 200, gambar & CSS jalan (pakai `http://`, bukan https)