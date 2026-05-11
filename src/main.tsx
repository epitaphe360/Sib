import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { initializeSentry } from './lib/sentry';
import { ThemeProvider } from './context/ThemeContext';
import { SalonProvider } from './contexts/SalonContext';

// === DIAGNOSTIC GLOBAL ===
window.addEventListener('error', (e) => {
  console.error('[SIB] Erreur globale:', e.message, 'Fichier:', e.filename, 'Ligne:', e.lineno, e.error);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[SIB] Promise rejetée:', e.reason);
});

try {
  initializeSentry();
} catch (e) {
}

// In development: unregister any stale service workers to prevent them from
// intercepting Vite HMR requests and slowing down the dev server
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  }).catch(() => {});
  if ('caches' in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
      }
    }).catch(() => {});
  }
}

// Version check

// Trouve le conteneur de montage
const findMount = () =>
  document.getElementById('sib-networking-app') ||
  document.getElementById('sib-exhibitor-dashboard-app') ||
  document.getElementById('root');

// Track si déjà monté pour éviter les doubles montages
let isMounted = false;

const mount = (el: Element) => {
  if (isMounted) {
    return;
  }

  isMounted = true;

  try {
    ReactDOM.createRoot(el as HTMLElement).render(
      <React.StrictMode>
        <ThemeProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SalonProvider>
              <App />
            </SalonProvider>
          </Router>
        </ThemeProvider>
      </React.StrictMode>
    );
  } catch (e) {
    console.error('[SIB] CRASH au montage React:', e);
    (el as HTMLElement).innerHTML = `<div style="padding:2rem;font-family:monospace;color:red;background:#fff">
      <h2>Erreur au démarrage</h2>
      <pre>${e instanceof Error ? e.stack : String(e)}</pre>
    </div>`;
  }
};

const initial = findMount();
if (initial) {
  mount(initial);
} else {
  // Si Elementor insère le shortcode après coup, observer et monter dès apparition
  const observer = new MutationObserver(() => {
    const el = findMount();
    if (el) {
      observer.disconnect();
      mount(el);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
