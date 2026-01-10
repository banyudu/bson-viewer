import { useEffect, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { parseBSON } from "~/utils/bson-helpers"
import { getCachedBSONData, cacheBSONData, getPendingBSONUrl, getTheme, saveTheme } from "~/utils/storage"
import { ErrorBoundary } from "~/components/ErrorBoundary"
import { MonacoBSONViewer } from "~/components/MonacoBSONViewer"
import { Toolbar, type Theme } from "~/components/Toolbar"
import { loader } from "@monaco-editor/react"
import * as monaco from "monaco-editor"
import { initMonacoEnvironment } from "~/utils/monaco-workers"
import "~/style.css"

// Configure Monaco to use local files and set up workers
// This must be done before any Monaco editor is created
if (typeof window !== "undefined") {
  // Configure loader to use local monaco-editor package (prevents CDN loading)
  // This tells @monaco-editor/react to use the bundled monaco-editor instead of CDN
  loader.config({ monaco })

  // Initialize Monaco environment for workers (only JSON is supported)
  initMonacoEnvironment()
}

function BSONViewer() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | undefined>()
  const [theme, setTheme] = useState<Theme>("vs")
  const [isFileUrl, setIsFileUrl] = useState(false)
  const [filePath, setFilePath] = useState<string>("")

  // Load saved theme preference on mount
  useEffect(() => {
    const loadSavedTheme = async () => {
      const savedTheme = await getTheme()
      // Validate that the saved theme is a valid Theme type
      const validThemes: Theme[] = ["vs", "vs-dark", "hc-black", "github-dark", "monokai", "solarized-dark"]
      if (savedTheme && validThemes.includes(savedTheme as Theme)) {
        setTheme(savedTheme as Theme)
      }
    }
    loadSavedTheme()
  }, [])

  // Save theme preference when it changes
  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme)
    await saveTheme(newTheme)
  }

  // Configure Monaco Editor themes
  useEffect(() => {
    const configureThemes = async () => {
      await loader.init()
      const monaco = await import("monaco-editor")
      
      // GitHub Dark theme
      monaco.editor.defineTheme("github-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6a737d", fontStyle: "italic" },
          { token: "string", foreground: "032f62" },
          { token: "number", foreground: "005cc5" },
          { token: "keyword", foreground: "d73a49" },
        ],
        colors: {
          "editor.background": "#0d1117",
          "editor.foreground": "#c9d1d9",
          "editor.lineHighlightBackground": "#161b22",
          "editor.selectionBackground": "#264f78",
        },
      })

      // Monokai theme
      monaco.editor.defineTheme("monokai", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "75715e" },
          { token: "string", foreground: "e6db74" },
          { token: "number", foreground: "ae81ff" },
          { token: "keyword", foreground: "f92672" },
          { token: "operator", foreground: "f92672" },
        ],
        colors: {
          "editor.background": "#272822",
          "editor.foreground": "#f8f8f2",
          "editor.lineHighlightBackground": "#3e3d32",
          "editor.selectionBackground": "#49483e",
        },
      })

      // Solarized Dark theme
      monaco.editor.defineTheme("solarized-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "586e75", fontStyle: "italic" },
          { token: "string", foreground: "2aa198" },
          { token: "number", foreground: "d33682" },
          { token: "keyword", foreground: "859900" },
        ],
        colors: {
          "editor.background": "#002b36",
          "editor.foreground": "#839496",
          "editor.lineHighlightBackground": "#073642",
          "editor.selectionBackground": "#586e75",
        },
      })
    }

    configureThemes()
  }, [])

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

        // Get URL from query parameters (set by background script or persisted from previous load)
        const params = new URLSearchParams(window.location.search)
        let url = params.get("url")

        // If no URL in query params, try to get from extension storage (declarativeNetRequest redirect)
        if (!url) {
          // Try to get the pending URL from storage
          const pendingUrl = await getPendingBSONUrl()
          if (pendingUrl) {
            url = pendingUrl
            // Immediately update URL in address bar to persist it
            const viewerUrl = new URL(window.location.href)
            viewerUrl.searchParams.set("url", url)
            window.history.replaceState(null, "", viewerUrl.toString())
          }
        }

        // If still no URL, try to get from referrer (declarativeNetRequest redirect)
        if (!url) {
          const referrer = document.referrer
          if (referrer && isBSONUrl(referrer)) {
            url = referrer // Keep full URL including query params
            // Immediately update URL in address bar to persist it
            const viewerUrl = new URL(window.location.href)
            viewerUrl.searchParams.set("url", url)
            window.history.replaceState(null, "", viewerUrl.toString())
          }
        }

        // If still no URL, try to get from sessionStorage (set by background script)
        if (!url) {
          const storedUrl = sessionStorage.getItem("bson_url")
          if (storedUrl) {
            url = storedUrl
            sessionStorage.removeItem("bson_url")
            // Immediately update URL in address bar to persist it
            const viewerUrl = new URL(window.location.href)
            viewerUrl.searchParams.set("url", url)
            window.history.replaceState(null, "", viewerUrl.toString())
          }
        }

        if (!url) {
          // No URL provided - show file picker UI
          setLoading(false)
          setIsFileUrl(true)
          setFilePath("")
          return
        }

        setOriginalUrl(url)

        // Check if it's a file:// URL
        const isFile = checkIsFileUrl(url)
        setIsFileUrl(isFile)

        if (isFile) {
          const path = getFilePathFromUrl(url)
          setFilePath(path)
          setLoading(false)
          // Don't try to fetch file:// URLs, show file selection UI instead
          return
        }

        // Update page title and URL to show original URL
        try {
          const urlObj = new URL(url)
          document.title = `BSON Viewer - ${urlObj.pathname.split("/").pop() || "BSON File"}`
          // Update URL to show original URL in query params using history.replaceState
          const viewerUrl = new URL(window.location.href)
          viewerUrl.searchParams.set("url", url)
          window.history.replaceState(null, "", viewerUrl.toString())
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

  /**
   * Check if a URL is a file:// URL
   */
  const checkIsFileUrl = (url: string): boolean => {
    return url.startsWith("file://")
  }

  /**
   * Extract file path from file:// URL
   */
  const getFilePathFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return decodeURIComponent(urlObj.pathname)
    } catch {
      // Fallback: remove file:// prefix
      return url.replace(/^file:\/\//, "")
    }
  }

  /**
   * Handle file selection for file:// URLs or manual uploads
   */
  const handleFileSelect = async (file: File) => {
    try {
      setLoading(true)
      setError(null)

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Parse BSON
      const parsed = parseBSON(arrayBuffer)
      setData(parsed)
      
      // Update page title
      document.title = `BSON Viewer - ${file.name}`
      
      // Update originalUrl to reflect the new file
      const cacheUrl = `file://${file.name}`
      setOriginalUrl(cacheUrl)
      
      // Cache the parsed data (use the file name as the cache key)
      await cacheBSONData(cacheUrl, parsed)
      setLoading(false)
      setIsFileUrl(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load BSON file")
      setLoading(false)
    }
  }

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  /**
   * Handle drag and drop
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files[0]
    if (file && file.name.toLowerCase().endsWith(".bson")) {
      handleFileSelect(file)
    } else if (file) {
      setError("Please drop a .bson file")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Add visual feedback when dragging over the page
    if (e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy"
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

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

  // Show file selection UI for file:// URLs or when no URL is provided
  if (isFileUrl) {
    const fileName = filePath ? filePath.split("/").pop() || "file.bson" : null
    return (
      <div 
        className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center p-8 max-w-md">
          <div className="text-blue-600 dark:text-blue-400 text-6xl mb-4">📁</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Select BSON File</h2>
          {filePath ? (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Chrome extensions cannot directly access local files. Please select the file to view:
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Drag and drop a BSON file anywhere on this page, or click the button below to select a file.
            </p>
          )}
          {fileName && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 font-mono break-all">
              {fileName}
            </p>
          )}
          <div className="mb-6">
            <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-md">
              <input
                type="file"
                accept=".bson"
                onChange={handleFileInputChange}
                className="hidden"
              />
              Choose File
            </label>
          </div>
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-4">{error}</p>
          )}
        </div>
      </div>
    )
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
    <div 
      className="bson-viewer min-h-screen bg-white dark:bg-gray-900"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
        <Toolbar 
          data={data} 
          originalUrl={originalUrl} 
          theme={theme} 
          onThemeChange={handleThemeChange}
          onFileUpload={handleFileSelect}
        />
      </div>
      <div className="monaco-container">
        <ErrorBoundary>
          <MonacoBSONViewer data={data} theme={theme} />
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default BSONViewer

