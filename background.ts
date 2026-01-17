import { setPendingBSONUrl } from "~/utils/storage"
import { normalizeUrl } from "~/utils/url-helpers"

/**
 * Check if a URL should bypass the BSON viewer (has bypass_bson_viewer=true parameter)
 */
function shouldBypassViewer(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.has("bypass_bson_viewer")
  } catch {
    return url.includes("bypass_bson_viewer=true")
  }
}

/**
 * Check if a URL is our extension's viewer page
 */
function isViewerPage(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "chrome-extension:" && urlObj.pathname.includes("bson-viewer.html")
  } catch {
    return url.includes("bson-viewer.html")
  }
}

/**
 * Check if a URL is a blob or data URL (should not be intercepted)
 */
function isBlobOrDataUrl(url: string): boolean {
  return url.startsWith("blob:") || url.startsWith("data:")
}

/**
 * Check if a URL is an extension URL (should not be intercepted)
 */
function isExtensionUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "chrome-extension:" || urlObj.protocol === "chrome:"
  } catch {
    return url.startsWith("chrome-extension:") || url.startsWith("chrome:")
  }
}

/**
 * Check if a URL points to a BSON file by examining the pathname
 */
function isBSONUrl(url: string): boolean {
  // Skip blob/data URLs and extension URLs
  if (isBlobOrDataUrl(url) || isExtensionUrl(url)) {
    return false
  }
  
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    return pathname.toLowerCase().endsWith(".bson")
  } catch {
    // If URL parsing fails, fall back to simple string check
    // But still skip blob/data/extension URLs
    if (url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("chrome-extension:") || url.startsWith("chrome:")) {
      return false
    }
    return url.toLowerCase().includes(".bson")
  }
}

// Use webNavigation to catch BSON URLs early (before tabs.onUpdated)
// This ensures we catch the URL even if tabs.onUpdated fires with a different state
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId === 0 && details.url) {
    // Main frame navigation only
    const url = normalizeUrl(details.url)
    
    // Skip viewer pages, blob/data URLs, and extension URLs
    if (isViewerPage(url) || isBlobOrDataUrl(url) || isExtensionUrl(url)) {
      return
    }
    
    // Skip if URL has bypass parameter
    if (shouldBypassViewer(url)) {
      return
    }
    
    if (isBSONUrl(url)) {
      // Store the URL for the viewer to retrieve (fallback if tabs.onUpdated doesn't fire)
      await setPendingBSONUrl(url, details.tabId)
    }
  }
})

// Handle navigation to BSON files - this is the primary interception method
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    const url = normalizeUrl(tab.url)
    
    // Skip viewer pages, blob/data URLs, and extension URLs
    if (isViewerPage(url) || isBlobOrDataUrl(url) || isExtensionUrl(url)) {
      return
    }
    
    // Skip if URL has bypass parameter
    if (shouldBypassViewer(url)) {
      return
    }
    
    // Check if navigating to a BSON file
    if (isBSONUrl(url)) {
      // Redirect to viewer with URL parameter
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(`tabs/bson-viewer.html?url=${encodeURIComponent(url)}`)
      })
    }
  }
})

// Handle download interception as alternative method
chrome.downloads.onCreated.addListener((downloadItem) => {
  if (downloadItem.state !== "in_progress") {
    return
  }

  const url = normalizeUrl(downloadItem.url || "")
  const filename = downloadItem.filename || ""

  // Skip viewer pages, blob/data URLs, and extension URLs
  if (isViewerPage(url) || isBlobOrDataUrl(url) || isExtensionUrl(url)) {
    return
  }

  // Skip if URL has bypass parameter
  if (shouldBypassViewer(url)) {
    return
  }

  // Check if it's a BSON file
  if (
    isBSONUrl(url) ||
    filename.toLowerCase().endsWith(".bson") ||
    downloadItem.mime === "application/bson"
  ) {
    // Cancel the download
    chrome.downloads.cancel(downloadItem.id, () => {
      // Open viewer page with the BSON URL
      chrome.tabs.create({
        url: chrome.runtime.getURL(`tabs/bson-viewer.html?url=${encodeURIComponent(url)}`)
      })
    })
  }
})

// Handle action button click - open the BSON viewer page
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("tabs/bson-viewer.html")
  })
})
