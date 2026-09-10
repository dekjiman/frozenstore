"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2, Upload, Video } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/client-api";

type MediaItem = {
  id: string;
  productId: string;
  mediaType: "image" | "video";
  url: string;
  storageKey: string | null;
  thumbnailUrl: string | null;
  posterUrl: string | null;
  altText: string;
  title: string;
  sortOrder: number;
  isPrimary: boolean;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  mimeType: string;
  fileSizeBytes: number | null;
};

type Props = {
  productId: string;
  onPrimaryChange?: (url: string) => void;
};

const MAX_MEDIA = 12;

export function ProductMediaManager({ productId, onPrimaryChange }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const result = await apiFetch<{ data: MediaItem[] }>(`/api/admin/products/${productId}/media`, { cache: "no-store" });
      setItems(result.data);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal memuat media");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const result = await apiFetch<{ data: MediaItem[] }>(`/api/admin/products/${productId}/media`, { cache: "no-store" });
        if (!cancelled) {
          setItems(result.data);
          setError(null);
        }
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Gagal memuat media");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [productId]);

  const upload = useCallback(
    async (files: FileList) => {
      setUploading(true);
      setError(null);
      try {
        for (const file of Array.from(files)) {
          if (items.length >= MAX_MEDIA) {
            setError(`Maksimal ${MAX_MEDIA} media per produk`);
            break;
          }
          const formData = new FormData();
          formData.append("file", file);
          formData.append("altText", file.name.replace(/\.[^.]+$/, ""));
          if (items.length === 0) formData.append("isPrimary", "true");
          await apiFetch(`/api/admin/products/${productId}/media`, { method: "POST", body: formData });
        }
        await load();
      } catch (caught) {
        setError(caught instanceof ApiError ? caught.message : "Gagal mengunggah media");
      } finally {
        setUploading(false);
      }
    },
    [productId, items.length, load],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.length) void upload(files);
      e.target.value = "";
    },
    [upload],
  );

  const remove = useCallback(
    async (item: MediaItem) => {
      if (!window.confirm(`Hapus media ini?`)) return;
      try {
        await apiFetch(`/api/admin/products/${productId}/media/${item.id}`, { method: "DELETE" });
        await load();
      } catch (caught) {
        setError(caught instanceof ApiError ? caught.message : "Gagal menghapus media");
      }
    },
    [productId, load],
  );

  const setPrimary = useCallback(
    async (item: MediaItem) => {
      try {
        await apiFetch(`/api/admin/products/${productId}/media/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isPrimary: true }),
        });
        await load();
        onPrimaryChange?.(item.url);
      } catch (caught) {
        setError(caught instanceof ApiError ? caught.message : "Gagal mengatur gambar utama");
      }
    },
    [productId, load, onPrimaryChange],
  );

  const move = useCallback(
    async (item: MediaItem, direction: "up" | "down") => {
      const idx = items.findIndex((i) => i.id === item.id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= items.length) return;
      const next = [...items];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      const orderedIds = next.map((i) => i.id);
      try {
        await apiFetch(`/api/admin/products/${productId}/media/reorder`, {
          method: "PUT",
          body: JSON.stringify({ orderedIds }),
        });
        setItems(next);
      } catch (caught) {
        setError(caught instanceof ApiError ? caught.message : "Gagal mengurutkan media");
      }
    },
    [productId, items],
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex h-20 items-center justify-center text-sm text-stone-400">Memuat media...</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-700)]">Gallery Produk</h3>
          <p className="mt-1 text-xs text-stone-400">{items.length}/{MAX_MEDIA} media</p>
        </div>
        {items.length < MAX_MEDIA ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-[var(--brand-600)] px-4 text-xs font-semibold text-white hover:bg-[var(--brand-700)] disabled:opacity-60"
          >
            {uploading ? <Upload size={14} className="animate-pulse" /> : <ImagePlus size={14} />}
            {uploading ? "Mengunggah..." : "Tambah"}
          </button>
        ) : null}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4" multiple onChange={onFileChange} className="hidden" aria-label="Unggah media produk" />

      {error ? (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">{error}</div>
      ) : null}

      {items.length === 0 ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 p-8 text-center hover:border-[var(--brand-500)] hover:bg-[var(--brand-50)]/50"
        >
          <ImagePlus size={28} className="text-stone-300" />
          <p className="text-sm font-medium text-stone-500">Belum ada media. Klik untuk unggah gambar atau video.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item, idx) => (
            <div key={item.id} className={`group relative overflow-hidden rounded-xl border-2 transition-colors ${item.isPrimary ? "border-[var(--brand-600)]" : "border-stone-200"}`}>
              <div className="aspect-square bg-stone-100">
                {item.mediaType === "video" ? (
                  <div className="flex h-full items-center justify-center bg-stone-900 text-white">
                    <Video size={24} />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnailUrl || item.url} alt={item.altText} className="h-full w-full object-cover" />
                )}
              </div>

              {item.isPrimary ? (
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[var(--brand-600)] px-2 py-0.5 text-[10px] font-semibold text-white">
                  <Star size={10} fill="currentColor" /> Utama
                </div>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" onClick={() => void move(item, "up")} disabled={idx === 0} aria-label="Pindah ke kiri" className="grid size-7 place-items-center rounded-full bg-white/90 text-stone-600 hover:bg-white disabled:opacity-30">
                  <ArrowUp size={13} />
                </button>
                <button type="button" onClick={() => void move(item, "down")} disabled={idx === items.length - 1} aria-label="Pindah ke kanan" className="grid size-7 place-items-center rounded-full bg-white/90 text-stone-600 hover:bg-white disabled:opacity-30">
                  <ArrowDown size={13} />
                </button>
                {!item.isPrimary ? (
                  <button type="button" onClick={() => void setPrimary(item)} aria-label="Jadikan gambar utama" className="grid size-7 place-items-center rounded-full bg-white/90 text-amber-600 hover:bg-white">
                    <Star size={13} />
                  </button>
                ) : null}
                <button type="button" onClick={() => void remove(item)} aria-label="Hapus media" className="grid size-7 place-items-center rounded-full bg-white/90 text-red-500 hover:bg-white">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
