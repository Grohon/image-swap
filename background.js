/**
 * Background Service Worker
 * Manages extension state and initialization
 */

// Initialize default settings on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enabled: true });
});

// Listen for storage changes to log state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.enabled) {
    // Extension state changed
  }
});
