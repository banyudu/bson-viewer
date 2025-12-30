import { useState } from "react"
import { bsonToJSON } from "~/utils/bson-helpers"

interface ToolbarProps {
  data: any
  originalUrl?: string
  onCopy?: () => void
  onDownload?: () => void
}

export function Toolbar({ data, originalUrl, onCopy, onDownload }: ToolbarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const json = bsonToJSON(data, true)
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopy?.()
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleDownload = () => {
    try {
      const json = bsonToJSON(data, true)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = originalUrl ? originalUrl.split("/").pop()?.replace(".bson", ".json") || "bson.json" : "bson.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      onDownload?.()
    } catch (error) {
      console.error("Failed to download:", error)
    }
  }

  return (
    <div className="toolbar flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={handleCopy}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {copied ? "✓ Copied" : "Copy JSON"}
      </button>
      <button
        onClick={handleDownload}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        Download JSON
      </button>
      {originalUrl && (
        <a
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Original
        </a>
      )}
    </div>
  )
}

