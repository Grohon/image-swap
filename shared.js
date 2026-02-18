/**
 * Shared utilities for ImageSwap extension
 */

const UrlMatcher = {
  /**
   * Convert a URL pattern (with wildcards) to a Regular Expression
   * @param {string} pattern - The pattern to convert (e.g., *://*.google.com/*)
   * @returns {RegExp}
   */
  patternToRegex(pattern) {
    const escaped = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*');
    return new RegExp('^' + escaped + '$');
  },

  /**
   * Test if a URL matches a pattern
   * @param {string} url - The URL to test
   * @param {string} pattern - The pattern to match against
   * @returns {boolean}
   */
  match(url, pattern) {
    const regex = this.patternToRegex(pattern);
    return regex.test(url);
  }
};

// Export for Node if needed, otherwise stay global for extension scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UrlMatcher;
}
