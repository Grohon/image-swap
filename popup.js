/**
 * Popup Script
 * Handles toggle functionality and settings navigation
 */

const toggleCheckbox = document.getElementById('toggleEnabled');
const statusLabel = document.getElementById('statusLabel');
const refreshButton = document.getElementById('refreshPage');
const refreshImagesButton = document.getElementById('refreshImages');
const openSettingsButton = document.getElementById('openSettings');

/**
 * Update UI based on enabled state
 */
function updateUI(enabled) {
  toggleCheckbox.checked = enabled;
  statusLabel.textContent = enabled ? 'Enabled' : 'Disabled';
}

/**
 * Load current state from storage
 */
chrome.storage.sync.get(['enabled'], (result) => {
  const enabled = result.enabled !== false; // Default to true
  updateUI(enabled);
});

/**
 * Handle toggle switch changes
 */
toggleCheckbox.addEventListener('change', (e) => {
  const enabled = e.target.checked;

  // Save to storage
  chrome.storage.sync.set({ enabled }, () => {
    updateUI(enabled);

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleEnabled',
          enabled: enabled
        }).catch(err => {
          console.log('Could not send message to content script:', err);
        });
      }
    });
  });
});

/**
 * Handle refresh button click
 */
refreshButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
      window.close();
    }
  });
});

/**
 * Handle refresh images button click
 */
refreshImagesButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'reprocessImages'
      }).then(() => {
        // Visual feedback
        refreshImagesButton.textContent = '✓ Images Refreshed';
        setTimeout(() => {
          refreshImagesButton.textContent = '🔄 Refresh Images';
        }, 1500);
      }).catch(err => {
        console.log('Could not send message to content script:', err);
      });
    }
  });
});

/**
 * Open settings page
 */
openSettingsButton.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

/**
 * Listen for storage changes from other sources
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.enabled) {
    updateUI(changes.enabled.newValue);
  }
});
