import { useEffect, useState, type FormEvent } from "react";
import { normalizeApiError } from "../../api/errors";
import { Button } from "../../components/Button";
import { InputField } from "../../components/Field";
import { InlineAlert } from "../../components/Feedback";
import { Modal } from "../../components/Modal";
import { useAuth } from "./auth-state";

type AuthMode = "login" | "register";

interface AuthDialogProps {
  open: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
}

/**
 * Presents login and registration in one accessible modal while preserving
 * the contract difference: registration creates an account, whereas login
 * creates the authenticated browser session.
 */
export function AuthDialog({
  open,
  initialMode = "login",
  onClose,
}: AuthDialogProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Reopening the dialog must reflect the caller-selected mode and discard
  // feedback from the previous interaction.
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError(null);
      setSuccess(null);
    }
  }, [open, initialMode]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password) {
      setError("Enter both your email and password.");
      return;
    }
    if (mode === "register" && password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
        onClose();
      } else {
        await register(email.trim(), password);
        setSuccess("Account created. You can sign in now.");
        setMode("login");
        setPassword("");
      }
    } catch (caught) {
      setError(normalizeApiError(caught).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title={mode === "login" ? "Sign in to operations" : "Create your account"}
      onClose={onClose}
      className="auth-modal"
    >
      <p className="modal__intro">
        {mode === "login"
          ? "Restore your private task workspace while weather search stays public."
          : "Registration creates your account. Sign in afterward to receive an access token."}
      </p>
      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}
      {success ? <InlineAlert tone="success">{success}</InlineAlert> : null}
      <form className="auth-form" onSubmit={submit}>
        <InputField
          id="auth-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <InputField
          id="auth-password"
          label="Password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint={mode === "register" ? "At least 8 characters" : undefined}
          required
        />
        <Button type="submit" busy={busy}>
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <div className="auth-switch">
        <span>
          {mode === "login" ? "New to the dashboard?" : "Already registered?"}
        </span>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
            setSuccess(null);
          }}
        >
          {mode === "login" ? "Create an account" : "Sign in instead"}
        </button>
      </div>
    </Modal>
  );
}
