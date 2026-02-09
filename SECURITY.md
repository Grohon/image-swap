# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Considerations

### Data Privacy
- **No data collection:** This extension does not collect, store, or transmit personal information
- **Local storage only:** All settings are stored locally using Chrome's `chrome.storage.sync`
- **No external tracking:** No analytics, tracking pixels, or third-party monitoring

### Permissions
The extension requires the following permissions:

1. **`<all_urls>`** - Access to all websites
   - **Purpose:** Replace images on any webpage you visit
   - **Scope:** Limited to reading and modifying image elements only
   - **User control:** Can be restricted using URL Patterns feature

2. **`storage`** - Chrome storage access
   - **Purpose:** Save user preferences and settings
   - **Data stored:** Whitelist entries, URL patterns, custom CSS, enabled state

3. **`activeTab`** - Active tab access
   - **Purpose:** Communicate with current tab to refresh images
   - **Scope:** Only when you click the extension icon

### External Dependencies
- **Picsum Photos API:** Used to generate placeholder images
  - Requests made directly from your browser
  - No intermediary servers
  - Subject to Picsum Photos' terms and privacy policy

### Code Security
- **No `eval()`:** Code does not use `eval()` or similar dangerous functions
- **No inline scripts:** All scripts are external files
- **No remote code execution:** No code is loaded from external sources
- **Input validation:** User inputs (selectors, CSS) are validated before use

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** create a public GitHub issue

Security vulnerabilities should be reported privately to avoid exploitation.

### 2. Report via private channel

**Preferred methods:**
- **GitHub Issues:** https://github.com/Grohon/image-swap/issues (add "Security" label)
- **GitHub Security Advisory:** Use GitHub's "Security" tab → "Report a vulnerability"

**Please DO NOT:**
- Post on public forums
- Tweet or publicize the vulnerability
- Exploit the vulnerability

### 3. Provide detailed information

When reporting, please include:
- **Description:** Clear explanation of the vulnerability
- **Impact:** Potential security impact or risk
- **Steps to reproduce:** How to trigger the vulnerability
- **Affected versions:** Which versions are vulnerable
- **Suggested fix:** If you have one (optional)
- **Your contact info:** So we can follow up with you

### 4. Response timeline

We aim to:
- **Acknowledge receipt:** Within 48 hours
- **Initial assessment:** Within 7 days
- **Status update:** Every 7 days until resolved
- **Fix release:** Varies by severity (critical: ASAP, others: next release)

### 5. Disclosure timeline

- We request **90 days** before public disclosure
- We will credit you in the release notes (unless you prefer anonymity)
- We will notify you before releasing the fix

## Security Best Practices for Users

### Safe Usage
1. **Review permissions:** Understand why the extension needs each permission
2. **Use URL patterns:** Restrict extension to specific websites if desired
3. **Review custom CSS:** Only add CSS rules you understand
4. **Regular updates:** Keep the extension updated to get security patches

### What to Check
- Extension only modifies image sources, nothing else
- No unexpected network requests (check DevTools → Network tab)
- Settings stored locally (check `chrome://extensions` → Storage)

### Red Flags to Report
If you notice any of the following, please report immediately:
- Extension accessing data it shouldn't (passwords, form data, etc.)
- Unexpected network requests to unknown domains
- Extension requesting additional permissions without explanation
- Suspicious behavior or performance issues

## Known Limitations

### Not Security Issues
The following are known behaviors and NOT security vulnerabilities:

1. **Broad host permissions (`<all_urls>`)**
   - Required for core functionality
   - Can be restricted using URL Patterns
   - Extension only reads/modifies image elements

2. **Custom CSS injection**
   - User-provided CSS is applied to pages
   - User is responsible for CSS content
   - Basic sanitization is performed (removal of `<script>` tags)

3. **External API dependency (Picsum Photos)**
   - Browser makes direct requests to picsum.photos
   - Subject to Picsum's availability and policies
   - No extension-controlled intermediary

## Security Enhancements (Roadmap)

Future security improvements we're considering:

- [ ] Enhanced CSS sanitization (stricter CSP compliance)
- [ ] Content Security Policy meta tag injection
- [ ] Option to disable custom CSS for paranoid users
- [ ] Fallback handling for external API failures
- [ ] Rate limiting to prevent API abuse
- [ ] Subresource Integrity (SRI) for any future external resources

## Audit and Transparency

### Open Source
- **Full source code:** Available on GitHub for review
- **No obfuscation:** All code is readable and auditable
- **No minification:** Development version is human-readable

### Third-Party Audits
We have not yet undergone a formal security audit. If you're a security researcher interested in auditing this extension:
- Review the source code on GitHub
- Report findings via our vulnerability reporting process
- We're open to formal audit partnerships

## Contact

**Security-related inquiries:**
- GitHub Issues: https://github.com/Grohon/image-swap/issues (use "Security" label)
- GitHub Repository: https://github.com/Grohon/image-swap

**General support:**
- GitHub Issues: https://github.com/Grohon/image-swap/issues

---

**Last Updated:** January 29, 2026

---

## Responsible Disclosure Hall of Fame

We will acknowledge security researchers who responsibly disclose vulnerabilities:

*(No vulnerabilities reported yet)*

---

**Thank you for helping keep ImageSwap Extension secure!**
