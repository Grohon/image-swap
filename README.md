# ImageSwap - Chrome Extension

A Chrome extension that instantly swaps all webpage images with beautiful, randomly generated Picsum Photos while maintaining original dimensions. Perfect for designers, developers, and anyone who wants to transform their browsing experience.

## Features

✨ **Automatic Image Replacement**
- Replaces all `<img>` tags and `<source>` elements with Picsum Photos URLs
- Preserves original dimensions when available
- Falls back to 300x300 for images without dimensions
- Supports responsive images in `<picture>` elements

🔄 **Dynamic Content Support**
- Uses MutationObserver to handle dynamically loaded images
- Works with single-page applications and AJAX content
- Automatically processes images added after page load

🎯 **Stable Image Generation**
- Generates consistent seeds based on image attributes (alt, id, class)
- Same image gets the same Picsum photo across page reloads
- Prevents flickering and improves user experience

⚡ **Performance Optimized**
- Tracks processed images to avoid redundant operations
- Skips images already using Picsum URLs
- Efficient attribute extraction and dimension calculation

🎛️ **Toggle Control**
- Enable/disable functionality via popup UI
- Settings persist across browser sessions
- Instant on/off without page reload

⚪ **Whitelist Support**
- Exclude specific images from replacement using any CSS selector
- Supports `.class`, `#id`, and nested selectors like `.parent img`
- Manage whitelist entries from the settings page

🌐 **Active URL Filtering**
- Control which websites the extension runs on
- Support for wildcard patterns (e.g., `*://*.example.com/*`)
- **Per-URL replacement modes** — override the global mode for specific sites
- **Inline URL editing** — edit URL patterns directly without removing and re-adding
- Leave the list empty to run on all sites

🎨 **Custom CSS Injection**
- Add custom CSS rules to enhance image visibility
- Built-in sanitization for security
- Persistent across sessions via Chrome Sync

🔀 **Replacement Modes**
- **Global mode**: Set a default replacement behaviour for all sites
  - *Replace All* — replace every image on the page
  - *Failed Only* — replace only broken/failed images
- **Per-URL override**: Each Active URL can use its own mode
  - *Default* — follow the global mode
  - *Replace All* / *Failed Only* — override for that specific site

## Installation

### Install from Chrome Web Store

1. Visit the [ImageSwap on Chrome Web Store](https://chromewebstore.google.com/detail/imageswap/fckckikjcnkcnkdojemjcmdlaligmaom).
2. Click **Add to Chrome** and confirm the installation.

### Load as Unpacked Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the extension folder
5. The extension is now installed and active!

### Icons Included

The extension includes all necessary icons in the `icons/` folder:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)
- `icon.png` (main icon)

## Usage

### Basic Usage

1. Navigate to any webpage
2. The extension automatically replaces all images with Picsum photos
3. Original dimensions are preserved when possible

### Toggle On/Off

1. Click the extension icon in the Chrome toolbar
2. Use the toggle switch to enable/disable the feature
3. Click "Refresh Page" to reload with updated settings

### Configure Settings

Click the extension icon and select **"Settings"** to access the full options page:

**Whitelist Images:**
1. Enter any CSS selector (e.g. `.logo`, `#header-img`, `.wrapper img`)
2. Click **Add** to add the entry
3. Matching images will be skipped during replacement

**Active URLs:**
1. Add URL patterns to control which sites are affected
2. Use `*` as a wildcard — e.g. `*://*.example.com/*`, `*://github.com/*`
3. Leave the list empty to run on all sites
4. Each URL entry has:
   - A **replacement mode dropdown** — choose *Default*, *Replace All*, or *Failed Only* per site
   - An **Edit** button — modify the URL pattern inline without deleting it
   - A **Remove** button — delete the entry

**Global Replacement Mode:**
- **Replace All**: Replaces every image (default)
- **Failed Images Only**: Only replaces broken/failed images
- Per-URL modes override this when set to anything other than *Default*

**Custom CSS:**
- Add custom CSS rules to control image appearance
- Default: `.image-proxy-override { visibility: visible !important; }`
- Changes apply immediately after saving

### How It Works

1. **Dimension Extraction**: The extension extracts width and height from:
   - HTML attributes (`width`, `height`)
   - Computed styles (if attributes are missing)
   - Falls back to 300x300 if neither is available

2. **Seed Generation**: Creates a stable hash from image attributes:
   - `alt` text
   - `id`
   - `class`
   - Data attributes

   This ensures the same image always gets the same Picsum photo.

3. **URL Construction**: Builds Picsum URLs in the format:
   ```
   https://picsum.photos/seed/{seed}/{width}/{height}
   ```

4. **Dynamic Monitoring**: MutationObserver watches for:
   - New images added to the DOM
   - Changes to existing image `src` attributes

## File Structure

```
imageswap/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker for state management
├── content.js             # Main logic for image replacement
├── popup.html             # Popup UI structure
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── options.html           # Settings page structure
├── options.css            # Settings page styling
├── options.js             # Settings page functionality
├── LICENSE                # MIT License
├── PRIVACY_POLICY.md      # Privacy policy
├── SECURITY.md            # Security policy
├── CREDITS.md             # Credits and attributions
├── README.md              # This file
└── icons/                 # Extension icons
    ├── icon16.png
    ├── icon48.png
    ├── icon128.png
    └── icon.png
```

## Code Explanation

### content.js

The core content script that:
- Processes all images on page load
- Sets up MutationObserver for dynamic content
- Generates stable seeds for consistent images
- Handles enable/disable state from popup

**Key Functions:**
- `generateSeed(img)` - Creates hash from image attributes
- `getImageDimensions(img)` - Extracts or computes dimensions
- `replaceImageSrc(img)` - Replaces src with Picsum URL
- `processImages()` - Processes all images on the page
- `observeDynamicImages()` - Watches for new/changed images

### popup.js

Manages the popup interface:
- Loads current enabled/disabled state
- Handles toggle switch changes
- Syncs state with content script
- Provides page refresh functionality

### background.js

Service worker that:
- Initializes default settings on installation (sets `enabled: true`)
- Monitors storage changes for extension state

### options.js

Manages the settings/options page:
- Whitelist management (add/remove CSS selector entries)
- URL pattern configuration with inline editing
- Global and per-URL replacement mode selection
- Custom CSS editor with sanitization

## Customization

### Change Default Dimensions

Edit the constants in `content.js`:
```javascript
const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 300;
```

### Modify Seed Generation

Update the `generateSeed()` function to include/exclude different attributes:
```javascript
const attributes = [
  img.alt || '',
  img.id || '',
  // Add more attributes here
].join('|');
```

### Adjust Picsum URL Format

Modify the URL construction in `replaceImageSrc()`:
```javascript
// Add blur effect
const picsumUrl = `https://picsum.photos/seed/${seed}/${width}/${height}?blur`;

// Add grayscale
const picsumUrl = `https://picsum.photos/seed/${seed}/${width}/${height}?grayscale`;
```

## Testing

1. Visit websites with various image types:
   - Static images
   - Lazy-loaded images
   - Dynamically added images (e.g., infinite scroll)

2. Check browser console for logs:
   - `[ImageSwap] Processing X images`
   - `[ImageSwap] Replaced image: WIDTHxHEIGHT, seed: SEED`

3. Test toggle functionality:
   - Disable extension
   - Refresh page
   - Images should load normally

## Troubleshooting

**Images not replacing:**
- Check if extension is enabled in popup
- Verify extension is active on the current tab
- Check browser console for errors

**Wrong dimensions:**
- Some images may not have dimensions set
- Falls back to 300x300 in such cases
- Can be adjusted by modifying defaults

**Extension not appearing:**
- Ensure Developer Mode is enabled
- Check for manifest.json errors
- Reload the extension

## Future Enhancements

- [ ] Allow users to set custom default dimensions
- [ ] Add blur/grayscale filters
- [ ] Statistics (images replaced counter)
- [ ] Support for background images

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Privacy

Your privacy is important. This extension does not collect, store, or transmit any personal information. All settings are stored locally in your browser. For more information, see our [Privacy Policy](PRIVACY_POLICY.md).

## Security

If you discover a security vulnerability, please review our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

## Credits

See [CREDITS.md](CREDITS.md) for attributions and acknowledgments.

## Repository

**GitHub:** https://github.com/Grohon/image-swap
**Issues:** https://github.com/Grohon/image-swap/issues
**Author:** Abu Foysal

---

**ImageSwap** - Transform your browsing experience with beautiful placeholder images! ✨
