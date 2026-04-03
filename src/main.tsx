import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// PWA Service Worker guard: unregister in iframe/preview to prevent stale cache
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app");

if (isPreviewHost || isInIframe) {
  // Aggressively clear all SW caches in dev/preview
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
  caches?.keys().then((names) => {
    names.forEach((name) => caches.delete(name));
  });
} else {
  // Production: force SW to check for updates on every page load
  navigator.serviceWorker?.ready.then((registration) => {
    registration.update();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
