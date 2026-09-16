"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Facebook, Send, X, Mail, Share2, type LucideIcon } from "lucide-react";

type ShareOption = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
};

type ShareButtonProps = {
  title: string;
  url: string;
  image?: string;
  iconOnly?: boolean;
};

function buildOptions(title: string, url: string, encodedTitle: string, encodedUrl: string): ShareOption[] {
  return [
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: Send,
      color: "bg-[#25D366]",
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
      color: "bg-[#1877F2]",
    },
    {
      id: "x",
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: X,
      color: "bg-[#000000]",
    },
    {
      id: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: Send,
      color: "bg-[#0088CC]",
    },
    {
      id: "email",
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: Mail,
      color: "bg-[#EA4335]",
    },
  ];
}

export function ShareButton({ title, url, image, iconOnly = false }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const options = buildOptions(title, url, encodedTitle, encodedUrl);

  useEffect(() => {
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("touchstart", onPointerDown);
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        const shareData: ShareData = { title, text: title, url };
        if (image && typeof navigator.canShare === "function") {
          try {
            const file = await fetch(image).then((res) => res.blob()).then((blob) => new File([blob], "image", { type: blob.type }));
            const withFile = { ...shareData, files: [file] };
            if (navigator.canShare(withFile)) {
              await navigator.share(withFile);
              return;
            }
          } catch {
            // fallback ke share tanpa file
          }
        }
        await navigator.share(shareData);
        return;
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setOpen(true);
        return;
      }
    }
    setOpen((current) => !current);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Salin tautan:", url);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => void handleShare()}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Bagikan"
        className={
          iconOnly
            ? "grid size-10 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-white text-[var(--ink-700)] shadow-sm transition hover:border-[var(--brand-600)] hover:text-[var(--brand-600)]"
            : "inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-700)] transition hover:text-[var(--brand-600)]"
        }
      >
        <Share2 size={16} />
        {!iconOnly && "Bagikan"}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-[fade-in_0.15s_ease-out] rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl"
        >
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Bagikan lewat
          </p>
          <div className="space-y-1">
            {options.map((option) => (
              <a
                key={option.id}
                role="menuitem"
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[var(--ink-700)] transition hover:bg-stone-50"
              >
                <span className={`grid size-8 place-items-center rounded-full text-white ${option.color}`}>
                  <option.icon size={15} />
                </span>
                {option.label}
              </a>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleCopyLink()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[var(--ink-700)] transition hover:bg-stone-50"
            >
              <span className="grid size-8 place-items-center rounded-full bg-stone-100 text-stone-600">
                {copied ? <Check size={15} className="text-[var(--success)]" /> : <Link2 size={15} />}
              </span>
              {copied ? "Tautan disalin!" : "Salin tautan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}