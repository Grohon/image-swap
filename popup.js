/**
 * Popup Script
 * Handles toggle functionality and settings navigation
 */

const toggleCheckbox = document.getElementById('toggleEnabled');
const statusLabel = document.getElementById('statusLabel');
const openSettingsButton = document.getElementById('openSettings');

/**
 * Update UI based on enabled state
 */
function updateUI(enabled) {
  toggleCheckbox.checked = enabled;
  statusLabel.textContent = enabled ? 'Enabled' : 'Disabled';

  // Hide site toggle if global is disabled
  const siteToggleContainer = document.getElementById('siteToggleContainer');
  if (!enabled) {
    siteToggleContainer.style.display = 'none';
  } else {
    // Re-check site match
    checkCurrentSiteMatch();
  }
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
          // Could not send message to content script
        });
      }
    });
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
  if (namespace === 'sync') {
    if (changes.enabled) {
      updateUI(changes.enabled.newValue);
    }
    if (changes.urlPatterns) {
      checkCurrentSiteMatch();
    }
  }
});

/**
 * Check if current site matches any URL pattern
 */
async function checkCurrentSiteMatch() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;

  const currentUrl = tab.url;
  const result = await chrome.storage.sync.get(['enabled', 'urlPatterns']);
  const globalEnabled = result.enabled !== false;

  const siteToggleContainer = document.getElementById('siteToggleContainer');

  if (!globalEnabled) {
    siteToggleContainer.style.display = 'none';
    return;
  }

  const patterns = result.urlPatterns || [];

  const currentSitePattern = document.getElementById('currentSitePattern');
  const toggleSiteEnabled = document.getElementById('toggleSiteEnabled');

  // Find matching patterns
  const matchingPatterns = [];

  for (let i = 0; i < patterns.length; i++) {
    const entry = patterns[i];
    const pattern = typeof entry === 'string' ? entry : entry.pattern;

    if (UrlMatcher.match(currentUrl, pattern)) {
      matchingPatterns.push({ entry, index: i });
    }
  }

  // Sort matching patterns:
  // 1. Enabled ones first
  // 2. Longer patterns (more specific) first
  matchingPatterns.sort((a, b) => {
    const aEnabled = typeof a.entry === 'string' ? true : (a.entry.enabled !== false);
    const bEnabled = typeof b.entry === 'string' ? true : (b.entry.enabled !== false);

    if (aEnabled !== bEnabled) {
      return aEnabled ? -1 : 1;
    }

    const aPattern = typeof a.entry === 'string' ? a.entry : a.entry.pattern;
    const bPattern = typeof b.entry === 'string' ? b.entry : b.entry.pattern;
    return bPattern.length - aPattern.length;
  });

  if (matchingPatterns.length > 0) {
    const bestMatch = matchingPatterns[0];
    const matchingPattern = bestMatch.entry;
    const matchingIndex = bestMatch.index;

    const patternStr = typeof matchingPattern === 'string' ? matchingPattern : matchingPattern.pattern;
    const isEnabled = typeof matchingPattern === 'string' ? true : (matchingPattern.enabled !== false);
    const currentMode = typeof matchingPattern === 'string' ? 'default' : (matchingPattern.mode || 'default');

    currentSitePattern.textContent = patternStr;
    toggleSiteEnabled.checked = isEnabled;
    siteToggleContainer.style.display = 'flex';

    // Set mode dropdown
    const siteModeSelect = document.getElementById('siteMode');
    siteModeSelect.value = currentMode;

    // Handle site-specific toggle change
    toggleSiteEnabled.onchange = (e) => {
      const newEnabled = e.target.checked;
      updateSitePatternEnabled(matchingIndex, newEnabled);
    };

    // Handle mode change
    siteModeSelect.onchange = (e) => {
      updateSitePatternMode(matchingIndex, e.target.value);
    };
  } else {
    siteToggleContainer.style.display = 'none';
  }
}

/**
 * Update enabled state for a specific URL pattern
 */
function updateSitePatternEnabled(index, enabled) {
  chrome.storage.sync.get(['urlPatterns'], (result) => {
    const patterns = [...(result.urlPatterns || [])];
    if (index >= 0 && index < patterns.length) {
      if (typeof patterns[index] === 'string') {
        patterns[index] = { pattern: patterns[index], mode: 'default', enabled };
      } else {
        patterns[index].enabled = enabled;
      }

      chrome.storage.sync.set({ urlPatterns: patterns }, () => {
        // Notify tabs
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'settingsUpdated' }).catch(() => {});
          });
        });
      });
    }
  });
}

/**
 * Update replacement mode for a specific URL pattern
 */
function updateSitePatternMode(index, mode) {
  chrome.storage.sync.get(['urlPatterns'], (result) => {
    const patterns = [...(result.urlPatterns || [])];
    if (index >= 0 && index < patterns.length) {
      if (typeof patterns[index] === 'string') {
        patterns[index] = { pattern: patterns[index], mode };
      } else {
        patterns[index].mode = mode;
      }

      chrome.storage.sync.set({ urlPatterns: patterns }, () => {
        // Notify tabs
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'settingsUpdated' }).catch(() => {});
          });
        });
      });
    }
  });
}

// Initial check
checkCurrentSiteMatch();
