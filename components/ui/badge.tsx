import type { ReactNode } from "react";

type BadgeVariant = "default" | "brand" | "accent" | "success" | "danger" | "muted";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-stone-100 text-[var(--ink-700)]",
  brand: "bg-[var(--brand-50)] text-[var(--brand-700)]",
  accent: "bg-amber-50 text-amber-700",
  success: "bg-emerald-50 text-[var(--success)]",
  danger: "bg-red-50 text-[var(--error)]",
  muted: "bg-stone-50 text-stone-500",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
