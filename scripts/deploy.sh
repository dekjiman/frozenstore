#!/usr/bin/env sh
# Deploy sederhana untuk produksi (dijalankan DI SERVER, di /opt/jasminefood).
# Pull kode terbaru -> rebuild image app -> tampilkan status -> health check.
set -e

cd "$(dirname "$0")/.."

if [ ! -f docker-compose.yml ]; then
  echo "error: jalankan dari direktori deploy (root repo, /opt/jasminefood)" >&2
  exit 1
fi

echo "==> [1/5] cek status git"
if [ -n "$(git status --porcelain)" ]; then
  echo "warning: ada perubahan lokal yang tidak di-commit:"
  git status --short
  echo "lanjut tetap pull? tekan Ctrl-C untuk batal (Enter untuk lanjut)"
  read -r _ || true
fi

echo "==> [2/5] pull kode terbaru dari origin/main"
git pull --ff-only origin main

echo "==> [3/5] rebuild image app (build args NEXT_PUBLIC_* dari .env)"
docker compose up -d --build app

echo "==> [4/5] status container"
docker compose ps app db

echo "==> [5/5] health check homepage"
BASE_URL="${NEXT_PUBLIC_BASE_URL:-}"
if [ -z "$BASE_URL" ] && [ -f .env ]; then
  BASE_URL="$(grep -E '^NEXT_PUBLIC_BASE_URL=' .env | cut -d= -f2-)"
fi
BASE_URL="${BASE_URL:-http://localhost:8080}"
curl -fsS -o /dev/null "$BASE_URL/"
echo "OK: $BASE_URL/ -> 200"