import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  busy?: boolean;
  children: ReactNode;
}

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
