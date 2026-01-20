/**
 * Background Service Worker
 * Manages extension state and initialization
 */

// Initialize default settings on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enabled: true }, () => {
    console.log('[Image Proxy] Extension installed and enabled by default');
  });
});

// Listen for storage changes to log state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.enabled) {
    const newValue = changes.enabled.newValue;
    console.log(`[Image Proxy] Extension ${newValue ? 'enabled' : 'disabled'}`);
  }
});
