// Defensive patch to prevent 'Uncaught TypeError: Cannot set property fetch of #<Window> which has only a getter'
// inside Sandboxed iframes and other restricted environments.
try {
  const originalFetch = window.fetch || globalThis.fetch;
  if (originalFetch) {
    let currentFetch = originalFetch;
    Object.defineProperty(window, 'fetch', {
      get() {
        return currentFetch;
      },
      set(value) {
        console.warn('Polyfill Interceptor: Blocked or recorded rewrite of window.fetch:', value);
        currentFetch = value;
      },
      configurable: true,
      enumerable: true,
    });
    
    if (typeof globalThis !== 'undefined' && globalThis !== window) {
      Object.defineProperty(globalThis, 'fetch', {
        get() {
          return currentFetch;
        },
        set(value) {
          console.warn('Polyfill Interceptor: Blocked or recorded rewrite of globalThis.fetch:', value);
          currentFetch = value;
        },
        configurable: true,
        enumerable: true,
      });
    }
  }
} catch (e) {
  console.warn('Unable to redefine fetch property descriptor on global namespace (expected in highly locked environments):', e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
);
