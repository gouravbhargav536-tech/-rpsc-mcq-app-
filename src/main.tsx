import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Proactive protection for fetch to prevent property override errors
// and ensure we don't accidentally monkey patch it incorrectly.
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  try {
    Object.defineProperty(window, 'fetch', {
      configurable: false,
      enumerable: true,
      get: () => originalFetch,
      set: () => {
        console.warn("Attempted to override window.fetch - override blocked for stability.");
      }
    });
  } catch (e) {
    console.debug("Fetch protection already active or not applicable.");
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
