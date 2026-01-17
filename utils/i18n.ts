/**
 * i18n utility functions for Chrome extension
 * Uses Chrome's i18n API which is automatically available in Plasmo extensions
 */

/**
 * Get a localized message by key
 * @param messageName - The key from messages.json
 * @param substitutions - Optional substitutions for placeholders ($1, $2, etc.)
 * @returns The localized message string
 */
export function getMessage(
  messageName: string,
  ...substitutions: string[]
): string {
  try {
    if (typeof chrome !== "undefined" && chrome.i18n) {
      // Pass substitutions only if there are any, otherwise pass undefined
      const subs = substitutions.length > 0 ? substitutions : undefined
      const result = chrome.i18n.getMessage(messageName, subs)
      // If chrome.i18n.getMessage returns empty string, fall back to messageName
      // This happens when the message key doesn't exist
      return result || messageName
    }
    // Fallback for development/testing when chrome.i18n is not available
    return messageName
  } catch (error) {
    console.warn(`Failed to get i18n message for key: ${messageName}`, error)
    return messageName
  }
}

/**
 * React hook for using i18n messages
 * @param messageName - The key from messages.json
 * @param substitutions - Optional substitutions for placeholders
 * @returns The localized message string
 */
export function useI18n(messageName: string, ...substitutions: string[]): string {
  // This is a simple wrapper - in a real hook, you'd want to handle re-renders
  // For now, we'll use the direct function call
  return getMessage(messageName, ...substitutions)
}
