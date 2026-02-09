# Privacy Policy for ImageSwap Extension

**Last Updated:** January 29, 2026
**Effective Date:** January 29, 2026

## Introduction

ImageSwap ("the Extension") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our Chrome extension.

## Information We Collect

### User Settings (Stored Locally)

The Extension stores the following user preferences using Chrome's `chrome.storage.sync` API:

- **Extension enabled/disabled state** - Whether the extension is active
- **Whitelist entries** - CSS selectors (class names and IDs) you choose to exclude from image replacement
- **URL patterns** - Website patterns where you want the extension to run
- **Replacement mode** - Your preference for "replace all" or "failed images only" mode
- **Custom CSS** - Optional custom CSS rules you provide to enhance image visibility

**Important:** All this data is stored locally in your browser and synced across your devices via Chrome Sync (if you have Chrome Sync enabled). We do NOT have access to this data.

### Data We Do NOT Collect

We want to be absolutely clear about what we DO NOT collect:

❌ **NO personal information** (name, email, address, phone number)
❌ **NO browsing history**
❌ **NO cookies or tracking data**
❌ **NO analytics or usage statistics**
❌ **NO form data or passwords**
❌ **NO financial information**
❌ **NO location data**
❌ **NO device information**
❌ **NO IP addresses**

## How We Use Information

### User Settings Usage

The settings you configure are used solely to:

1. **Control extension behavior** - Enable/disable functionality, apply whitelists, etc.
2. **Preserve your preferences** - Ensure your settings persist across browser sessions
3. **Sync across devices** - If Chrome Sync is enabled, your settings sync across your Chrome browsers

### No Data Transmission

**We do not transmit any data to external servers.** All processing happens locally in your browser.

## Third-Party Services

### Picsum Photos API

The Extension replaces webpage images with random images from **Picsum Photos** (https://picsum.photos). When an image is replaced:

- Your browser makes a direct request to `picsum.photos` to load the replacement image
- This request is made by your browser, not by us
- Picsum Photos may collect standard web server logs (IP address, user agent, etc.) as per their own privacy policy
- We do not control or have access to any data collected by Picsum Photos

**Please review Picsum Photos' privacy policy:** https://picsum.photos

### No Other Third Parties

The Extension does NOT:
- Share data with advertisers
- Use analytics services (Google Analytics, etc.)
- Integrate with social media platforms
- Include tracking pixels or beacons
- Load external scripts or libraries

## Data Storage and Security

### Local Storage

All user settings are stored using Chrome's built-in `chrome.storage.sync` API:

- **Storage location:** Your browser's local storage
- **Encryption:** Handled by Chrome (encrypted if Chrome Sync is enabled)
- **Access:** Only you and the Extension have access
- **Persistence:** Settings remain until you clear browser data or uninstall the extension

### Chrome Sync

If you have Chrome Sync enabled:
- Your extension settings sync across your Chrome browsers
- Data is encrypted by Google's Chrome Sync infrastructure
- We do not control this sync process
- See Google's privacy policy for Chrome Sync details

## Permissions Explained

The Extension requests the following permissions:

### "Access your data on all websites" (`<all_urls>`)

**Why we need it:** To replace images on any website you visit

**What we do with it:**
- ✅ Read image elements on webpages
- ✅ Replace image URLs with Picsum Photos URLs
- ✅ Apply custom CSS for image visibility

**What we DO NOT do:**
- ❌ Read or collect page content
- ❌ Track which websites you visit
- ❌ Monitor or log your activity

**Control:** You can restrict which websites the extension runs on using the URL Patterns feature in the settings.

### "Storage" (`storage`)

**Why we need it:** To save your extension settings

**What we store:** Only the user preferences listed in "Information We Collect" section

### "Active Tab" (`activeTab`)

**Why we need it:** To communicate with the currently active tab when you click the extension icon

**What we do:** Send messages to reload images or update settings on the current tab

## Your Rights and Control

### Access Your Data

You can view all stored settings at any time:
1. Click the extension icon
2. Click "Settings"
3. All saved settings are displayed on the options page

### Modify Your Data

You can change or delete any settings through the extension's options page.

### Delete Your Data

You can delete all extension data by:

**Option 1: Clear specific settings**
- Open extension settings
- Remove whitelist entries, URL patterns, etc.

**Option 2: Reset to defaults**
- Disable the extension
- Clear all custom settings in the options page

**Option 3: Complete removal**
- Uninstall the extension
- All data is automatically deleted when you uninstall

**Option 4: Clear Chrome storage**
- Go to `chrome://settings/clearBrowserData`
- Select "Cookies and other site data"
- Choose time range and clear data

### Opt-Out of Chrome Sync

If you don't want settings to sync across devices:
- Disable Chrome Sync in your browser settings
- Settings will remain local to the current browser only

## Children's Privacy

The Extension does not knowingly collect information from children under 13 years of age. We do not target children with this extension. If you are a parent or guardian and believe your child has used this extension, you can uninstall it to remove all associated data.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be reflected by updating the "Last Updated" date at the top of this policy.

**How you'll be notified:**
- Major changes: We will update the extension version and include changes in the changelog
- Minor changes: Updated date will be changed

We encourage you to review this policy periodically.

## Data Retention

- **User settings:** Retained until you delete them or uninstall the extension
- **No server-side data:** We don't retain any data because we don't collect any data on servers

## International Data Transfers

Since all data is stored locally in your browser:
- No international data transfers occur
- Your data stays on your device(s)
- If using Chrome Sync, Google handles any data transfers according to their policies

## Legal Basis for Processing (GDPR)

For users in the European Union:

**Legal basis:** Consent and Legitimate Interest

- You provide consent by installing and using the extension
- We have a legitimate interest in storing your settings to provide the functionality you expect

**Your GDPR Rights:**
- Right to access: View your settings in the options page
- Right to rectification: Modify settings anytime
- Right to erasure: Uninstall the extension
- Right to data portability: Settings are stored in standard JSON format
- Right to object: Disable or uninstall the extension

## California Privacy Rights (CCPA)

For California residents:

**We do not sell your personal information.** We don't collect personal information in the first place.

You have the right to:
- Know what data is collected (see "Information We Collect")
- Delete your data (uninstall the extension)
- Opt-out of data sales (not applicable - we don't sell data)

## Contact Information

If you have questions or concerns about this Privacy Policy:

**Support:**
- GitHub Issues: https://github.com/Grohon/image-swap/issues

**Response Time:** We aim to respond within 7 business days.

## Consent

By installing and using the ImageSwap Extension, you consent to this Privacy Policy.

## Open Source Transparency

This extension is open source (MIT License). You can:
- Review the complete source code
- Verify what data is collected (none)
- Audit our privacy claims
- Contribute improvements

**Source code:** https://github.com/Grohon/image-swap

## Summary (TL;DR)

✅ **We collect:** Only your extension settings (whitelist, URL patterns, etc.)
✅ **Stored:** Locally in your browser using Chrome storage
✅ **Access:** Only you can access your settings
❌ **We do NOT collect:** Personal info, browsing history, analytics, or tracking data
❌ **We do NOT share:** Any data with third parties (we don't have any data to share)
🔒 **Your control:** Uninstall the extension to delete all data

---

**This Privacy Policy is effective as of January 29, 2026.**
