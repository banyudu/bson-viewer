import { useEffect, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { parseBSON } from "~/utils/bson-helpers"
import { getCachedBSONData, cacheBSONData, getPendingBSONUrl } from "~/utils/storage"
import { ErrorBoundary } from "~/components/ErrorBoundary"
import { BSONTreeViewer } from "~/components/BSONTreeViewer"
import { Toolbar } from "~/components/Toolbar"
import { SearchBar } from "~/components/SearchBar"
import "~/style.css"

function BSONViewer() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [originalUrl, setOriginalUrl] = useState<string | undefined>()

  /**
   * Check if a URL points to a BSON file by examining the pathname
   */
  const isBSONUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      return pathname.toLowerCase().endsWith(".bson")
    } catch {
      // If URL parsing fails, fall back to simple string check
      return url.toLowerCase().includes(".bson")
    }
  }

  useEffect(() => {
    const loadBSON = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get URL from query parameters (set by background script)
        const params = new URLSearchParams(window.location.search)
        let url = params.get("url")

        // If no URL in query params, try to get from extension storage (declarativeNetRequest redirect)
        if (!url) {
          // Try to get the pending URL from storage
          const pendingUrl = await getPendingBSONUrl()
          if (pendingUrl) {
            url = pendingUrl
          }
        }

        // If still no URL, try to get from referrer (declarativeNetRequest redirect)
        if (!url) {
          const referrer = document.referrer
          if (referrer && isBSONUrl(referrer)) {
            url = referrer // Keep full URL including query params
          }
        }

        // If still no URL, try to get from sessionStorage (set by background script)
        if (!url) {
          const storedUrl = sessionStorage.getItem("bson_url")
          if (storedUrl) {
            url = storedUrl
            sessionStorage.removeItem("bson_url")
          }
        }

        if (!url) {
          setError("No BSON URL provided. Please navigate to a .bson file URL.")
          setLoading(false)
          return
        }

        setOriginalUrl(url)

        // Update page title and URL hash to show original URL
        try {
          const urlObj = new URL(url)
          document.title = `BSON Viewer - ${urlObj.pathname.split("/").pop() || "BSON File"}`
          // Update hash to show original URL (for display purposes)
          window.history.replaceState(null, "", `#${encodeURIComponent(url)}`)
        } catch {
          document.title = "BSON Viewer"
        }

        // Check cache first
        const cached = await getCachedBSONData(url)
        if (cached) {
          setData(cached)
          setLoading(false)
          return
        }

        await fetchAndParseBSON(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load BSON file")
        setLoading(false)
      }
    }

    loadBSON()
  }, [])

  const fetchAndParseBSON = async (url: string) => {
    try {
      // Try direct fetch first (works for same-origin)
      let arrayBuffer: ArrayBuffer

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        arrayBuffer = await response.arrayBuffer()
      } catch (fetchError) {
        // If direct fetch fails (CORS), use background script
        const result = await sendToBackground({
          name: "fetch-bson" as never,
          body: { url }
        })

        if (result.error) {
          throw new Error(result.error)
        }

        // Convert array back to ArrayBuffer
        const uint8Array = new Uint8Array(result.data)
        arrayBuffer = uint8Array.buffer
      }

      // Parse BSON
      const parsed = parseBSON(arrayBuffer)
      setData(parsed)
      
      // Cache the parsed data
      await cacheBSONData(url, parsed)
      setLoading(false)
    } catch (err) {
      throw err
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading BSON file...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center p-8">
          <div className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error Loading BSON</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No data to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bson-viewer min-h-screen bg-white dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
        <Toolbar data={data} originalUrl={originalUrl} />
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <SearchBar onSearch={setSearchQuery} placeholder="Search BSON data..." />
        </div>
      </div>
      <div className="p-4">
        <ErrorBoundary>
          <BSONTreeViewer data={data} searchQuery={searchQuery} />
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default BSONViewer

