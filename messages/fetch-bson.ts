import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { url } = req.body

  if (!url) {
    res.send({ error: "URL is required" })
    return
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    res.send({
      data: Array.from(new Uint8Array(arrayBuffer)),
      contentType: response.headers.get("content-type") || "application/bson"
    })
  } catch (error) {
    res.send({
      error: error instanceof Error ? error.message : "Failed to fetch BSON file"
    })
  }
}

export default handler

