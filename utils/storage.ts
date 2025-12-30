/**
 * Storage utilities for caching BSON data and user settings
 */

const CACHE_PREFIX = "bson_cache_"
const SETTINGS_KEY = "bson_viewer_settings"
const PENDING_URL_KEY = "bson_pending_url"

export interface ViewerSettings {
  autoIntercept: boolean
  fileSizeLimit: number // in MB
  theme: "light" | "dark"
  expandLevel: number
}

export const defaultSettings: ViewerSettings = {
  autoIntercept: true,
  fileSizeLimit: 10,
  theme: "light",
  expandLevel: 2
}

/**
 * Get viewer settings
 */
export async function getSettings(): Promise<ViewerSettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY)
  return result[SETTINGS_KEY] || defaultSettings
}

/**
 * Save viewer settings
 */
export async function saveSettings(settings: Partial<ViewerSettings>): Promise<void> {
  const current = await getSettings()
  await chrome.storage.local.set({
    [SETTINGS_KEY]: { ...current, ...settings }
  })
}

/**
 * Cache parsed BSON data
 */
export async function cacheBSONData(url: string, data: any): Promise<void> {
  const cacheKey = `${CACHE_PREFIX}${url}`
  await chrome.storage.local.set({
    [cacheKey]: {
      data,
      timestamp: Date.now()
    }
  })
}

/**
 * Get cached BSON data
 */
export async function getCachedBSONData(url: string): Promise<any | null> {
  const cacheKey = `${CACHE_PREFIX}${url}`
  const result = await chrome.storage.local.get(cacheKey)
  const cached = result[cacheKey]

  if (!cached) {
    return null
  }

  // Cache expires after 1 hour
  const oneHour = 60 * 60 * 1000
  if (Date.now() - cached.timestamp > oneHour) {
    await chrome.storage.local.remove(cacheKey)
    return null
  }

  return cached.data
}

/**
 * Clear all cached BSON data
 */
export async function clearCache(): Promise<void> {
  const items = await chrome.storage.local.get({} as Record<string, any>)
  const keysToRemove = Object.keys(items).filter((key) => key.startsWith(CACHE_PREFIX))
  if (keysToRemove.length > 0) {
    await chrome.storage.local.remove(keysToRemove)
  }
}

/**
 * Store pending BSON URL (used when declarativeNetRequest redirects without query params)
 */
export async function setPendingBSONUrl(url: string, tabId?: number): Promise<void> {
  const key = tabId ? `${PENDING_URL_KEY}_${tabId}` : PENDING_URL_KEY
  await chrome.storage.local.set({
    [key]: {
      url,
      timestamp: Date.now()
    }
  })
}

/**
 * Get and remove pending BSON URL
 */
export async function getPendingBSONUrl(tabId?: number): Promise<string | null> {
  const key = tabId ? `${PENDING_URL_KEY}_${tabId}` : PENDING_URL_KEY
  const result = await chrome.storage.local.get(key)
  const pending = result[key]

  if (!pending) {
    return null
  }

  // Clean up immediately after retrieving
  await chrome.storage.local.remove(key)

  // URL expires after 5 seconds (should be retrieved immediately)
  const fiveSeconds = 5 * 1000
  if (Date.now() - pending.timestamp > fiveSeconds) {
    return null
  }

  return pending.url
}

