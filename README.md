# BSON Viewer

<div align="center">

![BSON Viewer](docs/cover.png)

**A powerful Chrome extension for viewing BSON files with Monaco Editor**

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?style=for-the-badge&logo=google-chrome)](https://chromewebstore.google.com/detail/bson-viewer/ekobnmjnjfjmfnkimicdmbbbnmijdkjb)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/banyudu/bson-viewer)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

[Install Extension](https://chromewebstore.google.com/detail/bson-viewer/ekobnmjnjfjmfnkimicdmbbbnmijdkjb) • [Documentation](https://banyudu.github.io/bson-viewer/) • [Report Bug](https://github.com/banyudu/bson-viewer/issues)

</div>

---

## 🎯 Overview

BSON Viewer automatically intercepts BSON file requests in your browser and displays them in a beautiful, interactive viewer powered by Monaco Editor (the same editor used in VS Code). Perfect for MongoDB developers and anyone working with BSON data.

## ✨ Features

- 🚀 **Automatic Interception** - Seamlessly intercepts `.bson` file URLs and downloads
- 💎 **Monaco Editor** - Professional code editor with full syntax highlighting
- 🎨 **Multiple Themes** - VS Dark, GitHub Dark, Monokai, Solarized Dark, and more
- 🔍 **Search & Filter** - Find keys and values instantly in large BSON files
- 📋 **Copy & Export** - One-click copy or download as formatted JSON
- 📁 **File Upload** - Drag & drop or browse local BSON files
- 💾 **Smart Caching** - Faster loading with automatic 1-hour cache expiration
- 🔒 **Privacy First** - All processing happens locally, zero data collection
- ⚡ **High Performance** - Efficiently handles large BSON files

## 📦 Installation

### For Users

**Install from Chrome Web Store** (Recommended)

[![Install from Chrome Web Store](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png)](https://chromewebstore.google.com/detail/bson-viewer/ekobnmjnjfjmfnkimicdmbbbnmijdkjb)

Click the button above or visit: https://chromewebstore.google.com/detail/bson-viewer/ekobnmjnjfjmfnkimicdmbbbnmijdkjb

### For Developers

**Prerequisites:**
- Node.js 16+
- pnpm or npm

**Setup:**

```bash
# Clone the repository
git clone https://github.com/banyudu/bson-viewer.git
cd bson-viewer

# Install dependencies
pnpm install
# or
npm install

# Start development server
pnpm dev
# or
npm run dev

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the `build/chrome-mv3-dev` directory
```

**Build for Production:**

```bash
pnpm build    # Creates optimized bundle in build/chrome-mv3-prod/
pnpm package  # Creates distributable zip file
```

## 🚀 Usage

### Automatic Mode (Recommended)

1. **Install the extension** from the Chrome Web Store
2. **Navigate to any `.bson` URL** in your browser (e.g., `https://example.com/data.bson`)
3. **View instantly** - the extension automatically intercepts and displays the file

### Manual Upload Mode

1. **Click the extension icon** in your toolbar
2. **Drag & drop** a BSON file or click "Choose File"
3. **View and interact** with your data

### Features in the Viewer

- **Copy JSON** - Copy formatted JSON to clipboard
- **Download JSON** - Export as `.json` file
- **Search** - Find specific keys or values
- **Theme Switcher** - Choose from 6 professional themes
- **Monaco Editor** - Full keyboard shortcuts and editing features

## 🏗️ How It Works

The extension uses a multi-layer interception strategy with Chrome Manifest V3 APIs:

1. **webNavigation API** - Detects BSON navigation early
2. **tabs API** - Redirects browser tabs to the viewer
3. **downloads API** - Intercepts BSON downloads
4. **declarativeNetRequest** - Manages bypass rules for fetching
5. **Background Service Worker** - Handles CORS-restricted fetches
6. **Monaco Editor** - Provides professional code editing experience

All processing happens **locally in your browser** - no data is sent to external servers.

## ⚙️ Configuration

Access extension options:

- Right-click the extension icon → **Options**
- Or visit `chrome://extensions/` → Find "BSON Viewer" → Click **Details** → **Extension options**

**Available Settings:**
- 🎨 Theme preference (persists across sessions)
- 🔄 Auto-intercept toggle
- 📏 File size limits
- 📂 Default expand level

## 🛠️ Tech Stack

- **Framework**: [Plasmo](https://www.plasmo.com/) - Modern Chrome Extension framework
- **UI**: React 18 + TypeScript
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code's editor
- **BSON**: Official MongoDB BSON library
- **Styling**: Tailwind CSS
- **Build**: Parcel bundler (via Plasmo)

## 🔒 Privacy & Security

This extension is **100% privacy-focused**:

- ✅ **No data collection** - Zero analytics or tracking
- ✅ **Local processing** - All BSON parsing happens in your browser
- ✅ **No external servers** - No data transmission whatsoever
- ✅ **Automatic cleanup** - Cache expires after 1 hour
- ✅ **Open source** - Fully auditable code

Read our full [Privacy Policy](https://banyudu.github.io/bson-viewer/privacy-policy.html) or [PRIVACY.md](./PRIVACY.md).

## 📚 Documentation

- [**Website**](https://banyudu.github.io/bson-viewer/) - Official documentation
- [**CLAUDE.md**](./CLAUDE.md) - Architecture guide for AI-assisted development
- [**Privacy Policy**](https://banyudu.github.io/bson-viewer/privacy-policy.html) - Detailed privacy information

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please read [CLAUDE.md](./CLAUDE.md) for development guidelines and architecture details.

## 📝 Development Commands

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run clean        # Remove build artifacts

# Production
npm run build        # Full production build (with Monaco cleanup)
npm run build:no-cleanup  # Build without removing unused Monaco files
npm run package      # Create distributable zip

# Publishing
npm run post-version # Build, package, and push with tags
```

## 🐛 Known Issues & Limitations

- **file:// URLs**: Chrome extensions cannot fetch local `file://` URLs due to security restrictions. Use the file upload UI instead.
- **CORS**: Some servers may block cross-origin requests. The extension uses a background service worker to bypass most CORS issues.
- **Large Files**: Files >50MB may take longer to parse and display.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👨‍💻 Author

**Yudu Ban** ([@banyudu](https://github.com/banyudu))

- Email: banyudu@gmail.com
- GitHub: https://github.com/banyudu/bson-viewer

## ⭐ Show Your Support

If this extension helped you, please consider:

- ⭐ **Star** this repository
- 🐦 **Share** on social media
- ⭐ **Rate** on [Chrome Web Store](https://chromewebstore.google.com/detail/bson-viewer/ekobnmjnjfjmfnkimicdmbbbnmijdkjb)
- 🐛 **Report bugs** or suggest features via [Issues](https://github.com/banyudu/bson-viewer/issues)

## 🙏 Acknowledgments

- [Plasmo](https://www.plasmo.com/) - Modern extension framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Powerful code editor
- [MongoDB](https://www.mongodb.com/) - For the BSON format and library

---

<div align="center">

**[Install Now](https://chromewebstore.google.com/detail/bson-viewer/ekobnmjnjfjmfnkimicdmbbbnmijdkjb)** • **[View Documentation](https://banyudu.github.io/bson-viewer/)** • **[Report Issue](https://github.com/banyudu/bson-viewer/issues)**

Made with ❤️ for MongoDB developers

</div>
