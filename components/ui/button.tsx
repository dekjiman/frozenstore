import { type ButtonHTMLAttributes, type ReactElement, type ReactNode, cloneElement, forwardRef, isValidElement } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

interface ButtonAsButton extends ButtonBaseProps, ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: false;
  children: ReactNode;
}

interface ButtonAsChild extends ButtonBaseProps {
  asChild: true;
  className?: string;
  children: ReactElement;
}

type ButtonProps = ButtonAsButton | ButtonAsChild;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)] active:bg-[var(--brand-800)] shadow-sm",
  secondary:
    "bg-white text-[var(--ink-950)] border border-[var(--border)] hover:bg-stone-50 active:bg-stone-100",
  ghost:
    "bg-transparent text-[var(--ink-700)] hover:bg-stone-100 active:bg-stone-200",
  danger:
    "bg-[var(--error)] text-white hover:bg-red-700 active:bg-red-800",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-sm gap-2",
};

const buttonClassName = [
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className = "", ...props }, ref) => {
    const classes = [buttonClassName, variantStyles[variant], sizeStyles[size], className].join(" ");

    if ("asChild" in props && props.asChild && isValidElement(children)) {
      return cloneElement(children, {
        className: [classes, (children.props as { className?: string }).className ?? ""].join(" "),
        ref,
      } as React.HTMLAttributes<HTMLElement>);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { asChild: _asChild, ...rest } = props as ButtonAsButton;

    return (
      <button
        ref={ref}
        disabled={rest.disabled || loading}
        className={classes}
        {...rest}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
