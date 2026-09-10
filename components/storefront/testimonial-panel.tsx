"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import type { HomepageDTO } from "@/lib/queries/homepage";

type Testimonial = HomepageDTO["testimonials"][number];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "fill-[var(--accent-500)] text-[var(--accent-500)]" : "fill-stone-200 text-stone-200"}
        />
      ))}
    </div>
  );
}

export function TestimonialPanel({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <div className="flex-1">
      <h3 className="mb-3 font-serif text-lg font-bold text-[var(--ink-950)]">
        Apa Kata Mereka?
      </h3>

      <div className="space-y-2.5">
        {testimonials.slice(0, 3).map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-stone-200/80 bg-white p-3.5 transition hover:shadow-sm"
          >
            <StarRating rating={t.rating} />
            <p className="mt-2 text-[13px] leading-relaxed text-stone-600">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              {t.avatarUrl ? (
                <Image
                  src={t.avatarUrl}
                  alt={t.customerName}
                  width={28}
                  height={28}
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-7 place-items-center rounded-full bg-[var(--brand-50)] text-[10px] font-bold text-[var(--brand-700)]">
                  {t.customerName.charAt(0)}
                </span>
              )}
              <div>
                <p className="text-xs font-semibold text-[var(--ink-950)]">{t.customerName}</p>
                {t.customerTitle && (
                  <p className="text-[10px] text-stone-400">{t.customerTitle}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
