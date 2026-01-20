# Image Proxy - Chrome Extension

A Chrome extension that automatically replaces all images on webpages with randomly generated Picsum Photos URLs while maintaining original dimensions.

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
- Exclude specific images from replacement by class or id
- Add/remove whitelist entries from popup UI
- Changes apply immediately upon page refresh

## Installation

### Load as Unpacked Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `image-proxy-local` folder
5. The extension is now installed and active!

### Generate Icons (Optional)

The extension requires icons in the `icons/` folder:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

You can create these manually or use an icon generator. For now, you can comment out the icon references in `manifest.json` to run without icons.

## Usage

### Basic Usage

1. Navigate to any webpage
2. The extension automatically replaces all images with Picsum photos
3. Original dimensions are preserved when possible

### Toggle On/Off

1. Click the extension icon in the Chrome toolbar
2. Use the toggle switch to enable/disable the feature
3. Click "Refresh Page" to reload with updated settings

### Whitelist Images

To exclude specific images from replacement:

1. Click the extension icon
2. In the **Whitelist** section, select either:
   - **Class**: To exclude images with a specific CSS class
   - **ID**: To exclude images with a specific ID attribute
3. Enter the class name or ID value (without `.` or `#`)
4. Click the **+** button to add
5. Refresh the page to apply changes

**Examples:**
- To exclude `<img class="logo">`, add **Class**: `logo`
- To exclude `<img id="header-img">`, add **ID**: `header-img`
- To remove an entry, click the **✕** button next to it

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
image-proxy-local/
├── manifest.json       # Extension configuration (Manifest V3)
├── background.js       # Service worker for state management
├── content.js          # Main logic for image replacement
├── popup.html          # Popup UI structure
├── popup.css           # Popup styling
├── popup.js            # Popup functionality
├── README.md           # This file
└── icons/              # Extension icons (to be added)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
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
- Initializes default settings on installation
- Logs state changes for debugging

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
   - `[Image Proxy] Processing X images`
   - `[Image Proxy] Replaced image: WIDTHxHEIGHT, seed: SEED`

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

- [ ] Add options page for more customization
- [ ] Allow users to set custom default dimensions
- [ ] Add blur/grayscale filters
- [ ] Whitelist/blacklist specific domains
- [ ] Statistics (images replaced counter)
- [ ] Support for background images

## Version History

**v1.0.0** (2026-01-20)
- Initial release
- Basic image replacement functionality
- MutationObserver for dynamic content
- Popup UI with enable/disable toggle
- Stable seed generation
- Chrome Manifest V3 support

## License

Free to use and modify.
