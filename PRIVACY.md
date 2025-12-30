# Privacy Policy

**Last Updated:** January 2025

## Introduction

BSON Viewer ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use our Chrome extension.

## Data Collection and Storage

### Local Storage Only

BSON Viewer operates entirely locally on your device. All data is stored using Chrome's local storage API (`chrome.storage.local`) and never transmitted to external servers.

### Types of Data Stored

1. **User Settings**
   - Theme preference (light/dark mode)
   - Auto-intercept toggle
   - File size limits
   - Default expand level
   - Stored locally for your convenience

2. **Cached BSON Data**
   - Parsed BSON file content is temporarily cached locally to improve performance
   - Cache expires automatically after 1 hour
   - Cache is stored locally and never shared

3. **Temporary URLs**
   - BSON file URLs are temporarily stored during navigation (maximum 5 seconds)
   - Used only for internal extension functionality
   - Automatically deleted after use

### No External Data Transmission

- **No data is sent to external servers**
- **No analytics or tracking**
- **No user identification**
- **No data sharing with third parties**

## Permissions Usage

### Required Permissions

BSON Viewer requires the following permissions to function:

- **`declarativeNetRequest`**: Intercepts BSON file requests to display them in the viewer
- **`declarativeNetRequestWithHostAccess`**: Enables interception across all websites
- **`tabs`**: Redirects tabs to the viewer interface
- **`storage`**: Stores user preferences and temporary cache locally
- **`downloads`**: Intercepts BSON downloads and enables file downloads from the viewer
- **`webNavigation`**: Detects BSON file navigation
- **`host_permissions`**: Fetches BSON files from websites (only when explicitly requested by you)

All permissions are used solely for the extension's core functionality of viewing BSON files.

## Data Security

- All data is stored locally on your device using Chrome's secure storage APIs
- No data is transmitted over the network except when you explicitly request to fetch a BSON file
- Cached data automatically expires and is removed

## Your Rights

You have full control over your data:

- **Clear Cache**: You can clear cached BSON data at any time through the extension options
- **Uninstall**: Uninstalling the extension removes all stored data
- **Settings**: You can modify or reset your preferences at any time

## Data Retention

- **User Settings**: Stored until you change or uninstall the extension
- **Cached BSON Data**: Automatically deleted after 1 hour
- **Temporary URLs**: Deleted within 5 seconds of use

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

## Contact Us

If you have any questions about this Privacy Policy, please contact us at:

- Email: <banyudu@gmail.com>
- GitHub: [Project Repository](https://github.com/banyudu/bson-viewer)

## Compliance

This extension complies with:

- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR) principles
- California Consumer Privacy Act (CCPA) requirements

---

**Note**: This extension does not collect, transmit, or share any personal information. All functionality operates entirely on your local device.
