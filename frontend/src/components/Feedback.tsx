import type { ReactNode } from "react";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="spinner" role="status">
      <span className="spinner__ring" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function InlineAlert({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  children: ReactNode;
}) {
  return (
    <div className={`alert alert--${tone}`} role="status">
      {children}
    </div>
  );
}

export function EmptyState({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
