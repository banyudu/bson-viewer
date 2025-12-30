import { useState } from "react"
import { bsonToJSON } from "~/utils/bson-helpers"

export type Theme = "vs" | "vs-dark" | "hc-black" | "github-dark" | "monokai" | "solarized-dark"

interface ToolbarProps {
  data: any
  originalUrl?: string
  theme?: Theme
  onThemeChange?: (theme: Theme) => void
  onCopy?: () => void
  onDownload?: () => void
}

const themes: { value: Theme; label: string }[] = [
  { value: "vs", label: "Light" },
  { value: "vs-dark", label: "Dark" },
  { value: "hc-black", label: "High Contrast" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "monokai", label: "Monokai" },
  { value: "solarized-dark", label: "Solarized Dark" },
]

export function Toolbar({ data, originalUrl, theme = "vs", onThemeChange, onCopy, onDownload }: ToolbarProps) {
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
      <div className="flex items-center gap-2 ml-auto">
        <label htmlFor="theme-select" className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Theme:
        </label>
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => onThemeChange?.(e.target.value as Theme)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          {themes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
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

