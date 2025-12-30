import { useState, useMemo } from "react"
import { BSONNode } from "./BSONNode"

interface BSONTreeViewerProps {
  data: any
  searchQuery?: string
}

export function BSONTreeViewer({ data, searchQuery = "" }: BSONTreeViewerProps) {
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data
    }
    return filterObject(data, searchQuery.toLowerCase())
  }, [data, searchQuery])

  if (!filteredData || (typeof filteredData === "object" && Object.keys(filteredData).length === 0)) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        {searchQuery ? "No results found" : "Empty BSON document"}
      </div>
    )
  }

  return (
    <div className="bson-tree-viewer font-mono text-sm">
      <BSONNode name="root" value={filteredData} level={0} />
    </div>
  )
}

function filterObject(obj: any, query: string): any {
  if (typeof obj !== "object" || obj === null) {
    const str = String(obj).toLowerCase()
    return str.includes(query) ? obj : null
  }

  if (Array.isArray(obj)) {
    const filtered = obj
      .map((item) => filterObject(item, query))
      .filter((item) => item !== null)
    return filtered.length > 0 ? filtered : null
  }

  const filtered: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key.toLowerCase().includes(query)) {
      filtered[key] = value
    } else {
      const filteredValue = filterObject(value, query)
      if (filteredValue !== null) {
        filtered[key] = filteredValue
      }
    }
  }

  return Object.keys(filtered).length > 0 ? filtered : null
}

