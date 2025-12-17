import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { logStorageState, logLiftCounts, clearAllStorage } from './storage';

/**
 * Application entry point
 */
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// B2.6.2 - Expose debug helpers on window in development only.
// This enables manual tests like: window.debugHelpers.logStorageState()
if (typeof window !== 'undefined') {
  const isDevHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (isDevHost) {
    (window as any).debugHelpers = {
      logStorageState,
      logLiftCounts,
      clearAllStorage,
    };
    console.info('Debug helpers attached to window.debugHelpers (dev only).');
  }
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

