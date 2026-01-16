import { bsonToJSON, serializeBSON } from "~/utils/bson-helpers"
import { getMessage } from "~/utils/i18n"

export type Theme = "vs" | "vs-dark" | "hc-black" | "github-dark" | "monokai" | "solarized-dark"

interface ToolbarProps {
  data: any
  originalUrl?: string
  theme?: Theme
  onThemeChange?: (theme: Theme) => void
  onFileUpload?: (file: File) => void
}

const getThemes = (): { value: Theme; label: string }[] => [
  { value: "vs", label: getMessage("themeLight") },
  { value: "vs-dark", label: getMessage("themeDark") },
  { value: "hc-black", label: getMessage("themeHighContrast") },
  { value: "github-dark", label: getMessage("themeGitHubDark") },
  { value: "monokai", label: getMessage("themeMonokai") },
  { value: "solarized-dark", label: getMessage("themeSolarizedDark") },
]

/**
 * Extract clean filename from URL, removing query parameters and special characters
 */
function getCleanFilename(url: string, extension: string): string {
  try {
    const urlObj = new URL(url)
    // Get the pathname and extract the filename
    const pathname = urlObj.pathname
    const filename = pathname.split("/").pop() || `file.${extension}`

    // Remove any query parameters or special characters that might be in the filename
    // Split by common separators like `_`, `?`, `&` and take the first part
    const cleanName = filename.split("_")[0].split("?")[0].split("&")[0]

    // Ensure it ends with the correct extension
    if (cleanName.toLowerCase().endsWith(`.${extension}`)) {
      return cleanName
    }
    // If it had a different extension, replace it
    const nameWithoutExt = cleanName.replace(/\.[^/.]+$/, "")
    return `${nameWithoutExt}.${extension}`
  } catch {
    // If URL parsing fails, try simple string manipulation
    const filename = url.split("/").pop() || `file.${extension}`
    const cleanName = filename.split("_")[0].split("?")[0].split("&")[0]
    if (cleanName.toLowerCase().endsWith(`.${extension}`)) {
      return cleanName
    }
    const nameWithoutExt = cleanName.replace(/\.[^/.]+$/, "")
    return `${nameWithoutExt}.${extension}`
  }
}

export function Toolbar({ data, originalUrl, theme = "vs", onThemeChange, onFileUpload }: ToolbarProps) {
  const handleDownloadJSON = async () => {
    try {
      const json = bsonToJSON(data, true)
      const blob = new Blob([json], { type: "application/json" })

      // Convert blob to data URL for chrome.downloads.download
      // Data URLs are more reliable than blob URLs with chrome.downloads API
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      // Get clean filename, removing query parameters
      const filename = originalUrl
        ? getCleanFilename(originalUrl, "json")
        : "bson.json"

      // Use chrome.downloads.download API
      await chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: true
      })
    } catch (error) {
      console.error("Failed to download JSON:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      alert(getMessage("failedToDownloadJSON", errorMessage))
    }
  }

  const handleDownloadBSON = async () => {
    try {
      // Serialize the already-parsed BSON data back to binary format
      const bsonBuffer = serializeBSON(data)

      // Create blob from the BSON binary data
      const blob = new Blob([bsonBuffer], { type: "application/bson" })

      // Convert blob to data URL for chrome.downloads.download
      // Data URLs are more reliable than blob URLs with chrome.downloads API
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      // Get clean filename
      const filename = originalUrl
        ? getCleanFilename(originalUrl, "bson")
        : "bson.bson"

      // Use chrome.downloads.download API
      await chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: true
      })

      console.log("BSON download completed successfully")
    } catch (error) {
      console.error("Failed to download BSON:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      alert(getMessage("failedToDownloadBSON", errorMessage))
    }
  }

  const handleUploadBSON = () => {
    // Create a file input element
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".bson"
    input.style.display = "none"

    // Set up change handler
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && onFileUpload) {
        onFileUpload(file)
      }
      // Clean up
      document.body.removeChild(input)
    }

    // Handle cancellation
    input.oncancel = () => {
      document.body.removeChild(input)
    }

    // Add to DOM and trigger click
    document.body.appendChild(input)
    input.click()
  }

  return (
    <div className="toolbar flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={handleDownloadJSON}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {getMessage("downloadJSON")}
      </button>
      {originalUrl && (
        <button
          onClick={handleDownloadBSON}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {getMessage("downloadBSON")}
        </button>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <label htmlFor="theme-select" className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {getMessage("theme")}
        </label>
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => onThemeChange?.(e.target.value as Theme)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          {getThemes().map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleUploadBSON}
          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          {getMessage("uploadBSON")}
        </button>
      </div>
    </div>
  )
}


