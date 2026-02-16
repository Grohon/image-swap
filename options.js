/**
 * Options Page Script
 * Manages whitelist and URL patterns
 */

const whitelistInput = document.getElementById('whitelistInput');
const addWhitelistButton = document.getElementById('addWhitelist');
const whitelistList = document.getElementById('whitelistList');

const urlInput = document.getElementById('urlInput');
const addUrlButton = document.getElementById('addUrl');
const urlList = document.getElementById('urlList');

const customCssTextarea = document.getElementById('customCss');
const saveCustomCssButton = document.getElementById('saveCustomCss');

const saveNotification = document.getElementById('saveNotification');

// Default CSS
const DEFAULT_CSS = `.image-proxy-override {
  visibility: visible !important;
}`;

/**
 * Sanitize custom CSS to prevent security issues
 * Removes potentially dangerous content like script tags and javascript URLs
 */
function sanitizeCSS(css) {
  return css
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<\/?\w+[^>]*>/g, ''); // Remove HTML tags
}

/**
 * Show save notification
 */
function showSaveNotification() {
  saveNotification.classList.add('show');
  setTimeout(() => {
    saveNotification.classList.remove('show');
  }, 2000);
}

/**
 * Render whitelist entries
 */
function renderWhitelist(whitelist = []) {
  if (whitelist.length === 0) {
    whitelistList.innerHTML = '<p class="empty-message">No whitelist entries</p>';
    return;
  }

  whitelistList.innerHTML = whitelist.map((selector, index) => `
    <div class="list-item">
      <span>${selector}</span>
      <button class="btn-remove" data-type="whitelist" data-index="${index}">Remove</button>
    </div>
  `).join('');

  // Add event listeners
  document.querySelectorAll('[data-type="whitelist"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      removeWhitelistEntry(index);
    });
  });
}

/**
 * Render URL patterns
 */
function renderUrlPatterns(patterns = []) {
  if (patterns.length === 0) {
    urlList.innerHTML = '<p class="empty-message">Active on all sites</p>';
    return;
  }

  urlList.innerHTML = patterns.map((entry, index) => {
    const pattern = typeof entry === 'string' ? entry : entry.pattern;
    const mode = typeof entry === 'string' ? 'default' : (entry.mode || 'default');
    return `
    <div class="list-item">
      <span class="list-item-pattern">${pattern}</span>
      <div class="list-item-actions">
        <select class="url-mode-select" data-type="url-mode" data-index="${index}">
          <option value="default"${mode === 'default' ? ' selected' : ''}>Default</option>
          <option value="all"${mode === 'all' ? ' selected' : ''}>Replace All</option>
          <option value="failed"${mode === 'failed' ? ' selected' : ''}>Failed Only</option>
        </select>
        <button class="btn-remove" data-type="url" data-index="${index}">Remove</button>
      </div>
    </div>
  `;
  }).join('');

  // Add event listeners for remove buttons
  document.querySelectorAll('[data-type="url"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      removeUrlPattern(index);
    });
  });

  // Add event listeners for mode select dropdowns
  document.querySelectorAll('[data-type="url-mode"]').forEach(select => {
    select.addEventListener('change', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      updateUrlPatternMode(index, e.target.value);
    });
  });
}

/**
 * Add whitelist entry
 */
function addWhitelistEntry() {
  const selector = whitelistInput.value.trim();

  if (!selector) {
    return;
  }

  // Basic validation - try to use querySelector to validate selector
  try {
    document.querySelector(selector);
  } catch (e) {
    alert('Invalid CSS selector');
    return;
  }

  chrome.storage.sync.get(['whitelist'], (result) => {
    const whitelist = result.whitelist || [];

    // Check for duplicates
    if (whitelist.includes(selector)) {
      whitelistInput.value = '';
      return;
    }

    whitelist.push(selector);

    chrome.storage.sync.set({ whitelist }, () => {
      renderWhitelist(whitelist);
      whitelistInput.value = '';
      showSaveNotification();
    });
  });
}

/**
 * Remove whitelist entry
 */
function removeWhitelistEntry(index) {
  chrome.storage.sync.get(['whitelist'], (result) => {
    const whitelist = result.whitelist || [];
    whitelist.splice(index, 1);

    chrome.storage.sync.set({ whitelist }, () => {
      renderWhitelist(whitelist);
      showSaveNotification();
    });
  });
}

/**
 * Add URL pattern
 */
function addUrlPattern() {
  const pattern = urlInput.value.trim();

  if (!pattern) {
    return;
  }

  chrome.storage.sync.get(['urlPatterns'], (result) => {
    const patterns = result.urlPatterns || [];

    // Check for duplicates
    const isDuplicate = patterns.some(entry => {
      const existing = typeof entry === 'string' ? entry : entry.pattern;
      return existing === pattern;
    });
    if (isDuplicate) {
      urlInput.value = '';
      return;
    }

    patterns.push({ pattern, mode: 'default' });

    chrome.storage.sync.set({ urlPatterns: patterns }, () => {
      renderUrlPatterns(patterns);
      urlInput.value = '';
      showSaveNotification();
    });
  });
}

/**
 * Update replacement mode for a specific URL pattern
 */
function updateUrlPatternMode(index, mode) {
  chrome.storage.sync.get(['urlPatterns'], (result) => {
    const patterns = result.urlPatterns || [];
    if (index >= 0 && index < patterns.length) {
      // Ensure entry is an object
      if (typeof patterns[index] === 'string') {
        patterns[index] = { pattern: patterns[index], mode };
      } else {
        patterns[index].mode = mode;
      }

      chrome.storage.sync.set({ urlPatterns: patterns }, () => {
        showSaveNotification();
      });
    }
  });
}

/**
 * Remove URL pattern
 */
function removeUrlPattern(index) {
  chrome.storage.sync.get(['urlPatterns'], (result) => {
    const patterns = result.urlPatterns || [];
    patterns.splice(index, 1);

    chrome.storage.sync.set({ urlPatterns: patterns }, () => {
      renderUrlPatterns(patterns);
      showSaveNotification();
    });
  });
}

/**
 * Initialize options page
 */
function init() {
  updateVersion();

  // Load current settings
  chrome.storage.sync.get(['whitelist', 'urlPatterns', 'replacementMode', 'customCss'], (result) => {
    renderWhitelist(result.whitelist || []);

    // Migrate urlPatterns from flat strings to objects if needed
    let patterns = result.urlPatterns || [];
    let needsMigration = false;
    patterns = patterns.map(entry => {
      if (typeof entry === 'string') {
        needsMigration = true;
        return { pattern: entry, mode: 'default' };
      }
      return entry;
    });
    if (needsMigration) {
      chrome.storage.sync.set({ urlPatterns: patterns });
    }

    renderUrlPatterns(patterns);

    // Set replacement mode
    const mode = result.replacementMode || 'all';
    document.getElementById(mode === 'failed' ? 'modeFailed' : 'modeAll').checked = true;

    // Set custom CSS
    customCssTextarea.value = result.customCss || DEFAULT_CSS;
  });

  // Add event listeners
  addWhitelistButton.addEventListener('click', addWhitelistEntry);
  whitelistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addWhitelistEntry();
    }
  });

  addUrlButton.addEventListener('click', addUrlPattern);
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addUrlPattern();
    }
  });

  // Handle replacement mode change
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      chrome.storage.sync.set({ replacementMode: e.target.value }, () => {
        showSaveNotification();
      });
    });
  });

  // Handle custom CSS save
  saveCustomCssButton.addEventListener('click', () => {
    const customCss = sanitizeCSS(customCssTextarea.value.trim());
    chrome.storage.sync.set({ customCss }, () => {
      showSaveNotification();
      // Notify content scripts to reload CSS
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { action: 'reloadCss' }).catch(() => {});
        });
      });
    });
  });
}

function updateVersion() {
  // Get the manifest object
  const manifestData = chrome.runtime.getManifest();

  // Access the version field
  const version = manifestData.version;

  // Display it in your options page
  document.getElementById('version-number').textContent = "v" + version;
}

// Initialize
init();
