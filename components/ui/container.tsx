import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  /** Max width: "normal" = 1280px (common inner), "wide" = 1440px */
  width?: "normal" | "wide";
  className?: string;
  as?: "div" | "section" | "main";
}

export function Container({
  children,
  width = "normal",
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={[
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        width === "wide" ? "max-w-[1440px]" : "max-w-[1360px]",
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}
