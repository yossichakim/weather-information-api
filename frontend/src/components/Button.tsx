import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  busy?: boolean;
  children: ReactNode;
}

/**
 * Provides consistent visual variants and prevents duplicate actions while an
 * asynchronous operation is busy.
 */
export function Button({
  variant = "primary",
  busy = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} ${className}`.trim()}
      disabled={disabled || busy}
      {...props}
    >
      {busy ? <span className="button__spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}
