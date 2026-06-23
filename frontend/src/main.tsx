import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./features/auth/AuthContext";
import "./styles/index.css";

// AuthProvider owns session restoration and shared authentication state before
// feature components begin protected requests.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
