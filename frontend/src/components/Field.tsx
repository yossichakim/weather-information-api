import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}

function FieldShell({ id, label, hint, error, children }: FieldShellProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? (
        <span className="field__error" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
}

export function InputField({
  id,
  label,
  hint,
  error,
  className = "",
  ...props
}: InputFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        className={`field__control ${className}`.trim()}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    </FieldShell>
  );
}

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
}

export function TextareaField({
  id,
  label,
  hint,
  error,
  className = "",
  ...props
}: TextareaFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        className={`field__control field__textarea ${className}`.trim()}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  children: ReactNode;
}

export function SelectField({
  id,
  label,
  children,
  className = "",
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label}>
      <select
        id={id}
        className={`field__control field__select ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}
