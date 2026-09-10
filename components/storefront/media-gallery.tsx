"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";

type MediaItem = {
  id: string;
  mediaType: string;
  url: string;
  thumbnailUrl: string | null;
  posterUrl: string | null;
  altText: string | null;
  title: string | null;
  isPrimary: boolean;
};

interface MediaGalleryProps {
  media: MediaItem[];
}

function isVideo(item: MediaItem): boolean {
  return item.mediaType === "video";
}

function getThumbSrc(item: MediaItem): string {
  return item.thumbnailUrl ?? item.url;
}

function getAlt(item: MediaItem): string {
  return item.altText ?? item.title ?? "Media produk";
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = media.findIndex((m) => m.isPrimary);
    return idx >= 0 ? idx : 0;
  });
  const [fullscreen, setFullscreen] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const active = media[activeIndex] ?? media[0];

  const goTo = useCallback(
    (i: number) => setActiveIndex((i + media.length) % media.length),
    [media.length],
  );

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      else if (e.key === "ArrowLeft") goTo(activeIndex - 1);
      else if (e.key === "ArrowRight") goTo(activeIndex + 1);
      else if (e.key === "Tab") {
        const container = dialogRef.current;
        if (!container) return;
        const focusable = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, activeIndex, goTo]);

  useEffect(() => {
    if (!fullscreen) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 0);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [fullscreen]);

  useEffect(() => {
    const el = thumbRef.current;
    if (!el) return;
    const child = el.children[activeIndex] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeIndex]);

  if (media.length === 0) return null;

  const thumbList = (
    <div
      ref={thumbRef}
      className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0"
    >
      {media.map((item, i) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setActiveIndex(i)}
          className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-stone-100 transition sm:size-20 ${
            i === activeIndex
              ? "border-[var(--brand-600)]"
              : "border-transparent hover:border-stone-300"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getThumbSrc(item)}
            alt={getAlt(item)}
            className="h-full w-full object-cover"
          />
          {isVideo(item) && (
            <span className="absolute inset-0 grid place-items-center bg-black/20">
              <Play size={14} className="ml-0.5 text-white" fill="currentColor" />
            </span>
          )}
        </button>
      ))}
    </div>
  );

  function renderMain(item: MediaItem, onClick?: () => void) {
    if (isVideo(item)) {
      return (
        <div
          className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-2xl bg-stone-100"
          onClick={onClick}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.posterUrl ?? item.url}
            alt={getAlt(item)}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 grid place-items-center bg-black/20">
            <span className="grid size-16 place-items-center rounded-full bg-white/90 shadow-lg">
              <Play size={28} className="ml-1 text-[var(--ink-950)]" fill="currentColor" />
            </span>
          </div>
        </div>
      );
    }
    return (
      <div
        className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-2xl bg-stone-100"
        onClick={onClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt={getAlt(item)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col-reverse gap-3 lg:flex-row">
        {media.length > 1 && thumbList}
        {renderMain(active, () => setFullscreen(true))}
      </div>

      {fullscreen && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Galeri fullscreen"
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goTo(activeIndex - 1); }}
            className="absolute left-4 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            aria-label="Sebelumnya"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goTo(activeIndex + 1); }}
            className="absolute right-16 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            aria-label="Selanjutnya"
          >
            <ChevronRight size={20} />
          </button>

          <div
            className="max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {isVideo(active) ? (
              <video
                src={active.url}
                poster={active.posterUrl ?? undefined}
                controls
                className="max-h-[85vh] max-w-[90vw] rounded-lg"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={active.url}
                alt={getAlt(active)}
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
