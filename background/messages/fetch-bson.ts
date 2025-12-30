import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log('handler.fetch-bson called with:', req.body)
  const { url } = req.body

  if (!url) {
    console.error('handler.fetch-bson: No URL provided')
    res.send({ error: "URL is required" })
    return
  }

  console.log('handler.fetch-bson: Fetching URL:', url)

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
    console.log('handler.fetch-bson: Fetched', arrayBuffer.byteLength, 'bytes')
    
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

