// Defensive patch to prevent 'Uncaught TypeError: Cannot set property fetch of #<Window> which has only a getter'
// inside Sandboxed iframes and other restricted environments.
try {
  const handler = (e: ErrorEvent) => {
    const errorMsg = e.message || '';
    const errorObjMsg = e.error?.message || '';
    if (
      errorMsg.includes("Cannot set property 'fetch'") || 
      errorMsg.includes("fetch of #<Window>") ||
      errorMsg.includes("only a getter") ||
      errorObjMsg.includes("Cannot set property 'fetch'") ||
      errorObjMsg.includes("fetch of #<Window>") ||
      errorObjMsg.includes("only a getter")
    ) {
      console.warn("Polyfill Interceptor: Gracefully suppressed non-configurable global fetch-setter write error:", errorMsg || errorObjMsg);
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
  };
  window.addEventListener('error', handler, { capture: true });
} catch (e) {
  console.warn('Unable to register global error event listener for sandboxed fetch error protection:', e);
}

try {
  const originalFetch = window.fetch || globalThis.fetch;
  if (originalFetch) {
    let currentFetch = originalFetch;

    // 1. Try on Window.prototype if available (extremely effective for avoiding strict mode setter errors on instances)
    if (typeof Window !== 'undefined' && Window.prototype) {
      try {
        Object.defineProperty(Window.prototype, 'fetch', {
          get() {
            return currentFetch;
          },
          set(value) {
            console.warn('Polyfill Interceptor: Blocked or recorded re-write of Window.prototype.fetch:', value);
            currentFetch = value;
          },
          configurable: true,
          enumerable: true,
        });
      } catch (e) {
        console.warn('Unable to define fetch setter on Window.prototype:', e);
      }
    }

    // 2. Try on window directly
    try {
      Object.defineProperty(window, 'fetch', {
        get() {
          return currentFetch;
        },
        set(value) {
          console.warn('Polyfill Interceptor: Blocked or recorded re-write of window.fetch:', value);
          currentFetch = value;
        },
        configurable: true,
        enumerable: true,
      });
    } catch (e) {
      console.warn('Unable to define fetch setter on window:', e);
    }
    
    // 3. Try on globalThis
    if (typeof globalThis !== 'undefined') {
      try {
        Object.defineProperty(globalThis, 'fetch', {
          get() {
            return currentFetch;
          },
          set(value) {
            console.warn('Polyfill Interceptor: Blocked or recorded re-write of globalThis.fetch:', value);
            currentFetch = value;
          },
          configurable: true,
          enumerable: true,
        });
      } catch (e) {
        console.warn('Unable to define fetch setter on globalThis:', e);
      }
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
