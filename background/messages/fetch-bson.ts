import type { PlasmoMessaging } from "@plasmohq/messaging"
import { normalizeUrl } from "~/utils/url-helpers"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { url: rawUrl } = req.body
  const url = rawUrl ? normalizeUrl(rawUrl) : ""

  if (!url) {
    res.send({ error: "URL is required" })
    return
  }

  // Chrome extensions cannot fetch file:// URLs due to security restrictions
  if (url.startsWith("file://")) {
    res.send({ 
      error: "Cannot fetch file:// URLs. Please use the file selection UI in the viewer." 
    })
    return
  }

  try {
    // Add bypass parameter to URL to prevent declarativeNetRequest from intercepting
    const bypassUrl = (() => {
      try {
        const urlObj = new URL(url)
        urlObj.searchParams.set("bypass_bson_viewer", "true")
        return urlObj.toString()
      } catch {
        // If URL parsing fails, append query parameter
        const separator = url.includes("?") ? "&" : "?"
        return `${url}${separator}bypass_bson_viewer=true`
      }
    })()

    // Fetch the file directly (background scripts don't have CORS restrictions)
    const response = await fetch(bypassUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    
    // Return the data as an array for transmission
    res.send({
      data: Array.from(new Uint8Array(arrayBuffer)),
      contentType: response.headers.get("content-type") || "application/bson"
    })
  } catch (error) {
    console.error('handler.fetch-bson: Error:', error)
    res.send({
      error: error instanceof Error ? error.message : "Failed to fetch BSON file"
    })
  }
}

export default handler

