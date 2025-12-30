# BSON Viewer Chrome Extension

A Chrome extension that intercepts BSON file requests and displays them in a pretty-printed, interactive viewer - similar to JSON viewer extensions.

## Features

- 🚀 **Automatic Interception**: Automatically intercepts `.bson` file requests and opens them in the viewer
- 🎨 **Pretty-Printed Display**: Beautiful tree view with syntax highlighting and expand/collapse functionality
- 🔍 **Search**: Search through BSON data to find specific keys or values
- 📋 **Copy & Download**: Copy formatted JSON or download as JSON file
- 🌓 **Dark Mode**: Support for light and dark themes
- ⚡ **Fast**: Efficient parsing and rendering of large BSON files

## Getting Started

### Development

1. Install dependencies:

```bash
pnpm install
# or
npm install
```

1. Run the development server:

```bash
pnpm dev
# or
npm run dev
```

1. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-dev` directory

### Building for Production

```bash
pnpm build
# or
npm run build
```

This creates a production bundle in `build/chrome-mv3-prod` ready for packaging and distribution.

## How It Works

The extension uses Chrome Extension Manifest V3 APIs:

1. **DeclarativeNetRequest**: Intercepts `.bson` URL requests and redirects them to the viewer
2. **Downloads API**: Intercepts BSON file downloads and opens them in the viewer instead
3. **Background Service Worker**: Handles URL passing and CORS issues when fetching BSON data

## Usage

1. Navigate to any `.bson` file URL in your browser
2. The extension automatically intercepts the request and opens the viewer
3. Use the toolbar to copy JSON, download as JSON, or view the original file
4. Use the search bar to filter the BSON data
5. Click on expandable nodes to expand/collapse nested objects and arrays

## Configuration

Access the options page by:

- Right-clicking the extension icon → Options
- Or navigating to `chrome://extensions/` → Find "BSON Viewer" → Click "Options"

Settings include:

- Auto-intercept toggle
- File size limits
- Theme selection
- Default expand level

For further guidance, [visit Plasmo Documentation](https://docs.plasmo.com/)

## Privacy Policy

This extension operates entirely locally on your device. All data is stored using Chrome's local storage and never transmitted to external servers.

- **No data collection**: No analytics, tracking, or user identification
- **Local storage only**: All settings and cache are stored locally
- **No external transmission**: No data is sent to external servers
- **Automatic cache expiration**: Cached data expires after 1 hour

For complete details, see our [Privacy Policy](https://banyudu.github.io/bson-viewer/privacy-policy.html) or [PRIVACY.md](./PRIVACY.md).

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
