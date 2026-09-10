import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={[
        "mb-6 sm:mb-8",
        align === "center" ? "text-center" : "",
        className,
      ].join(" ")}
    >
      {eyebrow && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--brand-600)]">
          {eyebrow}
        </p>
      )}
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="heading-section font-serif text-[var(--ink-950)]">{title}</h2>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {description && (
        <p className="mt-2 text-sm text-[var(--ink-700)]">{description}</p>
      )}
    </div>
  );
}
