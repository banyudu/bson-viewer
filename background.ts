import { setPendingBSONUrl } from "~/utils/storage"

/**
 * Check if a URL points to a BSON file by examining the pathname
 */
function isBSONUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    return pathname.toLowerCase().endsWith(".bson")
  } catch {
    // If URL parsing fails, fall back to simple string check
    return url.toLowerCase().includes(".bson")
  }
}

// Use webNavigation to catch BSON URLs before declarativeNetRequest redirects
// This is more reliable than tabs.onUpdated for catching the original URL
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId === 0 && details.url) {
    // Main frame navigation only
    const url = details.url
    if (isBSONUrl(url) && !url.includes("bson-viewer.html")) {
      // Store the URL for the viewer to retrieve
      // Use a global key since we can't reliably match by tabId during redirect
      await setPendingBSONUrl(url)
    }
  }
})

// Handle navigation to BSON files (complement to declarativeNetRequest)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    const url = tab.url
    
    // Check if navigating to a BSON file (check pathname, not full URL)
    if (isBSONUrl(url) && !url.includes("bson-viewer.html")) {
      // Store the URL in case declarativeNetRequest redirects without query params
      await setPendingBSONUrl(url)
      
      // Redirect to viewer with URL parameter (if tabs.onUpdated fires before declarativeNetRequest)
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(`tabs/bson-viewer.html?url=${encodeURIComponent(url)}`)
      })
    }
  }
})

// Handle download interception as alternative method
chrome.downloads.onCreated.addListener((downloadItem) => {
  const url = downloadItem.url || ""
  const filename = downloadItem.filename || ""

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

