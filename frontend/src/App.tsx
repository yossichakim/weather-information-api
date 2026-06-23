import { useState } from "react";
import { Button } from "./components/Button";
import { InlineAlert } from "./components/Feedback";
import { AuthDialog } from "./features/auth/AuthDialog";
import { useAuth } from "./features/auth/auth-state";
import { TaskWorkspace } from "./features/tasks/TaskWorkspace";
import { WeatherWorkspace } from "./features/weather/WeatherWorkspace";

/**
 * Composes the public weather workspace with the authenticated task workspace
 * and coordinates application-level authentication dialogs and notices.
 */
export default function App() {
  const { user, status, message, clearMessage, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [logoutBusy, setLogoutBusy] = useState(false);

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const signOut = async () => {
    setLogoutBusy(true);
    try {
      await logout();
    } finally {
      setLogoutBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <header className="app-header">
        <a className="brand" href="#main-content" aria-label="Atmospheric Operations home">
          <span className="brand__mark" aria-hidden="true">
            <span />
          </span>
          <span>
            <strong>Atmospheric</strong>
            <small>Operations</small>
          </span>
        </a>
        <div className="header-actions">
          {status === "restoring" ? (
            <span className="session-label">Restoring session…</span>
          ) : user ? (
            <>
              <span className="session-label">
                Signed in as <strong>{user.email}</strong>
              </span>
              <Button variant="ghost" busy={logoutBusy} onClick={() => void signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => openAuth("login")}>
                Sign in
              </Button>
              <Button variant="secondary" onClick={() => openAuth("register")}>
                Create account
              </Button>
            </>
          )}
        </div>
      </header>

      <main id="main-content" className="dashboard">
        {message ? (
          <div className="global-notice">
            <InlineAlert tone={user ? "success" : "info"}>
              {message}{" "}
              <button className="text-button" onClick={clearMessage}>
                Dismiss
              </button>
            </InlineAlert>
          </div>
        ) : null}
        <div className="dashboard__intro">
          <span className="eyebrow">Weather-aware planning</span>
          <p>
            Current conditions and personal priorities, composed into one calm
            operating view.
          </p>
        </div>
        <div className="dashboard__grid">
          <WeatherWorkspace />
          <TaskWorkspace onRequestLogin={() => openAuth("login")} />
        </div>
      </main>

      <footer className="app-footer">
        <span>Current conditions. Deliberate action.</span>
        <span>Weather data is provided by the connected backend service.</span>
      </footer>

      <AuthDialog
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
