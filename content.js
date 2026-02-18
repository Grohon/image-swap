/**
 * Content Script: ImageSwap with Picsum Photos
 * Replaces all <img> src attributes with Picsum Photos URLs
 */

// Default dimensions if none can be determined
const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 300;

// Track processed images to avoid reprocessing with stable Picsum seeds
let imageProxyProcessedSet = new WeakSet();

/**
 * Ensure the processed set is valid
 */
function getProcessedSet() {
  if (!imageProxyProcessedSet || typeof imageProxyProcessedSet.has !== 'function') {
    imageProxyProcessedSet = new WeakSet();
  }
  return imageProxyProcessedSet;
}


// Whitelist cache (CSS selectors)
let whitelistCache = [];

// URL patterns cache
let urlPatternsCache = [];

// Replacement mode cache
let replacementMode = 'all';

/**
 * Inject CSS to ensure replaced images are visible
 */
function injectCSS() {
  const styleId = 'image-proxy-styles';

  // Remove existing style if present
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Load custom CSS from storage
  chrome.storage.sync.get(['customCss'], (result) => {
    const defaultCss = `.image-proxy-override {
  visibility: visible !important;
}`;

    const css = result.customCss || defaultCss;

    const style = document.createElement('style');
    style.id = styleId;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  });
}

/**
 * Load settings from storage
 */
function loadSettings(callback) {
  chrome.storage.sync.get(['whitelist', 'urlPatterns', 'replacementMode'], (result) => {
    whitelistCache = result.whitelist || [];
    const rawPatterns = result.urlPatterns || [];

    // Pre-compile regexes for better performance
    urlPatternsCache = rawPatterns.map(entry => {
      const pattern = typeof entry === 'string' ? entry : entry.pattern;
      return {
        ...(typeof entry === 'string' ? { pattern } : entry),
        regex: UrlMatcher.patternToRegex(pattern)
      };
    });

    replacementMode = result.replacementMode || 'all';
    if (callback) callback();
  });
}

/**
 * Check if current URL matches any pattern
 */
function isUrlAllowed() {
  // If no patterns configured at all, allow all URLs
  if (urlPatternsCache.length === 0) {
    return true;
  }

  // Filter to only enabled patterns
  const enabledPatterns = urlPatternsCache.filter(entry => entry.enabled !== false);

  // If patterns exist but all are disabled, do not activate
  if (enabledPatterns.length === 0) {
    return false;
  }

  const currentUrl = window.location.href;

  // Use pre-compiled regexes
  return enabledPatterns.some(entry => entry.regex.test(currentUrl));
}

/**
 * Get the effective replacement mode for the current URL
 * Checks per-URL mode first, falls back to global mode
 */
function getEffectiveReplacementMode() {
  const currentUrl = window.location.href;

  for (const entry of urlPatternsCache) {
    // Skip disabled patterns
    if (entry.enabled === false) continue;

    // Use pre-compiled regex
    if (entry.regex.test(currentUrl) && entry.mode && entry.mode !== 'default') {
      return entry.mode;
    }
  }

  // Fall back to global replacement mode
  return replacementMode;
}

/**
 * Check if image matches whitelist using CSS selectors
 */
function isWhitelisted(img) {
  return whitelistCache.some(selector => {
    try {
      return img.matches(selector);
    } catch (e) {
      // Fallback for invalid selectors
      return false;
    }
  });
}

/**
 * Generate a stable seed based on image attributes
 * This ensures the same image gets the same Picsum photo across reloads
 */
function generateSeed(img) {
  const attributes = [
    img.alt || '',
    img.id || '',
    img.className || '',
    img.dataset.src || '',
    img.getAttribute('loading') || ''
  ].join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < attributes.length; i++) {
    const char = attributes.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash);
}

/**
 * Get dimensions for an image element
 * Priority: attribute > computed style > default
 */
function getImageDimensions(img) {
  let width = parseInt(img.getAttribute('width')) || 0;
  let height = parseInt(img.getAttribute('height')) || 0;

  // If attributes are missing, try computed dimensions
  if (!width || !height) {
    const computedStyle = window.getComputedStyle(img);
    const computedWidth = parseInt(computedStyle.width);
    const computedHeight = parseInt(computedStyle.height);

    if (computedWidth > 0) width = computedWidth;
    if (computedHeight > 0) height = computedHeight;
  }

  // Fall back to defaults if still not determined
  if (!width || width < 1) width = DEFAULT_WIDTH;
  if (!height || height < 1) height = DEFAULT_HEIGHT;

  return { width, height };
}

/**
 * Check if image already uses Picsum URL
 */
function isPicsumUrl(url) {
  return url && (url.includes('picsum.photos/') || url.includes('picsum.photos?'));
}

/**
 * Generate Picsum Photos URL
 */
function getPicsumUrl(seed, width, height) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * Replace image src with Picsum Photos URL
 */
function replaceImageSrc(img) {
  // Skip if already processed
  if (getProcessedSet().has(img)) {
    return;
  }

  // Skip if whitelisted
  if (isWhitelisted(img)) {
    getProcessedSet().add(img);
    return;
  }

  // Skip if already using Picsum
  const currentSrc = img.getAttribute('src') || '';
  if (isPicsumUrl(currentSrc)) {
    getProcessedSet().add(img);
    return;
  }

  // Get dimensions
  const { width, height } = getImageDimensions(img);

  // Generate stable seed for consistent images
  const seed = generateSeed(img);

  // Construct Picsum URL with seed for stability
  const picsumUrl = getPicsumUrl(seed, width, height);

  // Check replacement mode (per-URL override or global)
  const effectiveMode = getEffectiveReplacementMode();
  if (effectiveMode === 'failed') {
    // Failed-only mode: only replace if image has failed or will fail
    // Check if already failed
    if (img.complete && img.naturalWidth === 0) {
      img.src = picsumUrl;
      img.classList.add('image-proxy-override');
      removeVisibilityStyles(img);
      getProcessedSet().add(img);
      return;
    }

    // Add error listener for future failures
    img.addEventListener('error', () => {
      if (!getProcessedSet().has(img)) {
        img.src = picsumUrl;
        img.classList.add('image-proxy-override');
        removeVisibilityStyles(img);
        getProcessedSet().add(img);
      }
    }, { once: true });

  } else {
    // Replace all mode (default)
    img.src = picsumUrl;
    img.classList.add('image-proxy-override');
    removeVisibilityStyles(img);
    getProcessedSet().add(img);

    // Add error handler for Picsum API failures
    img.addEventListener('error', (e) => {
      // If Picsum fails, mark as processed to avoid infinite loops
      if (img.src.includes('picsum.photos')) {
        getProcessedSet().add(img);
      }
    }, { once: true });
  }
}

/**
 * Remove visibility hiding styles
 */
function removeVisibilityStyles(img) {
  // Remove visibility: hidden and make image visible
  if (img.style.visibility === 'hidden') {
    img.style.visibility = '';
  }

  // Ensure the image is visible and reset display properties
  img.style.visibility = '';
}

/**
 * Replace source srcset with Picsum Photos URL
 * Uses the same URL as the img element in the picture
 */
function replaceSourceSrcset(source) {
  // Skip if already processed
  if (getProcessedSet().has(source)) {
    return;
  }

  // Check if parent picture element is whitelisted
  const picture = source.closest('picture');
  if (picture && (picture.id || picture.className)) {
    const mockImg = {
      id: picture.id,
      className: picture.className,
      classList: picture.classList
    };
    if (isWhitelisted(mockImg)) {
      getProcessedSet().add(source);
      return;
    }
  }

  // Skip if already using Picsum
  const currentSrcset = source.getAttribute('srcset') || '';
  if (isPicsumUrl(currentSrcset)) {
    getProcessedSet().add(source);
    return;
  }

  // Find the img element within the same picture
  const img = picture ? picture.querySelector('img') : null;

  // In failed-only mode, check if img has loaded successfully
  const effectiveMode = getEffectiveReplacementMode();
  if (effectiveMode === 'failed') {
    // If img exists and has loaded successfully, don't replace source
    if (img && img.complete && img.naturalWidth > 0) {
      getProcessedSet().add(source);
      return;
    }

    // If img hasn't loaded yet or failed, add error listener
    if (img && !img.complete) {
      img.addEventListener('error', () => {
        if (!getProcessedSet().has(source)) {
          replaceSourceWithPicsum(source, img);
        }
      }, { once: true });
      return;
    }

    // If img already failed, replace now
    if (img && img.complete && img.naturalWidth === 0) {
      replaceSourceWithPicsum(source, img);
      return;
    }
  } else {
    // Replace all mode - replace immediately
    replaceSourceWithPicsum(source, img);
  }
}

/**
 * Helper function to replace source srcset
 */
function replaceSourceWithPicsum(source, img) {
  if (img && img.src && isPicsumUrl(img.src)) {
    // Reuse the same Picsum URL from the img
    source.srcset = img.src;
  } else {
    // Fallback: generate URL using source's parent picture info
    const { width, height } = img ? getImageDimensions(img) : { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
    const seed = img ? generateSeed(img) : Math.floor(Math.random() * 100000);
    const picsumUrl = getPicsumUrl(seed, width, height);
    source.srcset = picsumUrl;
  }

  // Remove visibility: hidden and make element visible
  if (source.style) {
    if (source.style.visibility === 'hidden') {
      source.style.visibility = '';
    }
    // Also handle opacity
    if (source.style.opacity === '0') {
      source.style.opacity = '';
    }
  }

  // Ensure the source element is visible and reset display properties
  if (source.style) {
    source.style.visibility = '';
  }

  // Mark as processed
  getProcessedSet().add(source);
}

/**
 * Process all images on the page
 */
function processImages() {
  // Check if extension is enabled
  chrome.storage.sync.get(['enabled'], (result) => {
    const enabled = result.enabled !== false; // Default to true

    if (!enabled) {
      return;
    }

    // Check if current URL is allowed
    if (!isUrlAllowed()) {
      return;
    }

    const images = document.querySelectorAll('img');

    images.forEach(img => {
      replaceImageSrc(img);
    });

    // Also process source elements in picture tags
    const sources = document.querySelectorAll('picture > source');

    sources.forEach(source => {
      replaceSourceSrcset(source);
    });
  });
}

/**
 * Set up MutationObserver to handle dynamically added images
 */
function observeDynamicImages() {
  const observer = new MutationObserver((mutations) => {
    // Check if extension is enabled before processing
    chrome.storage.sync.get(['enabled'], (result) => {
      const enabled = result.enabled !== false;

      if (!enabled) return;

      mutations.forEach((mutation) => {
        // Check for added nodes
        mutation.addedNodes.forEach((node) => {
          // If the node itself is an image
          if (node.nodeName === 'IMG') {
            replaceImageSrc(node);
          }

          // If the node itself is a source element
          if (node.nodeName === 'SOURCE') {
            replaceSourceSrcset(node);
          }

          // If the node contains images or sources
          if (node.querySelectorAll) {
            const images = node.querySelectorAll('img');
            images.forEach(img => replaceImageSrc(img));

            const sources = node.querySelectorAll('picture > source');
            sources.forEach(source => replaceSourceSrcset(source));
          }
        });

        // Check for attribute changes on existing images
        if (mutation.type === 'attributes' && mutation.target.nodeName === 'IMG') {
          const img = mutation.target;
          // Only reprocess if src was changed to a non-Picsum URL
          if (mutation.attributeName === 'src' && !isPicsumUrl(img.src)) {
            getProcessedSet().delete(img); // Remove from processed set
            replaceImageSrc(img);
          }
        }

        // Check for attribute changes on source elements
        if (mutation.type === 'attributes' && mutation.target.nodeName === 'SOURCE') {
          const source = mutation.target;
          // Only reprocess if srcset was changed to a non-Picsum URL
          if (mutation.attributeName === 'srcset' && !isPicsumUrl(source.srcset)) {
            getProcessedSet().delete(source);
            replaceSourceSrcset(source);
          }
        }
      });
    });
  });

  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset']
  });

  return true; // Return true to indicate observer started
}

let observerStarted = false;

/**
 * Initialize the extension
 */
function init() {

  // Load settings first (whitelist + URL patterns)
  loadSettings(() => {
    // Check if URL is allowed before processing
    if (!isUrlAllowed()) {
      return;
    }

    // Process existing images
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', processImages);
    } else {
      processImages();
    }

    // Set up observer for dynamic content
    if (document.body) {
      observerStarted = observeDynamicImages();
    } else {
      // Wait for body to be available
      const bodyObserver = new MutationObserver((mutations, obs) => {
        if (document.body) {
          observerStarted = observeDynamicImages();
          obs.disconnect();
        }
      });
      bodyObserver.observe(document.documentElement, { childList: true });
    }
  });
}

// Listen for messages from popup to toggle functionality
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleEnabled') {
    if (request.enabled) {
      processImages();
    }
    sendResponse({ success: true });
  } else if (request.action === 'settingsUpdated') {
    // Reload settings and re-evaluate
    loadSettings(() => {
      if (isUrlAllowed()) {
        processImages();
        if (!observerStarted && document.body) {
          observerStarted = observeDynamicImages();
        }
      }
    });
    sendResponse({ success: true });
  } else if (request.action === 'reloadCss') {
    // Reload injected CSS
    injectCSS();
    sendResponse({ success: true });
  }
});

// Inject CSS to ensure replaced images are visible and start the extension
injectCSS();
init();
