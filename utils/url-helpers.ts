/**
 * Normalize a URL by adding https: protocol if no protocol is present
 * @param url - The URL to normalize
 * @returns The normalized URL with protocol
 */
export function normalizeUrl(url: string): string {
  // Check if URL already has a protocol
  // Common protocols: http:, https:, file:, blob:, data:, chrome-extension:, chrome:
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)
  
  if (hasProtocol) {
    return url
  }
  
  // Handle protocol-relative URLs (starting with //)
  // Convert them to https: protocol
  if (url.startsWith("//")) {
    return `https:${url}`
  }
  
  // If no protocol, prepend https://
  return `https://${url}`
}
