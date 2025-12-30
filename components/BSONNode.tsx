import { useState } from "react"
import { formatBSONValue, type BSONValue } from "~/utils/bson-helpers"

interface BSONNodeProps {
  name: string
  value: any
  level?: number
  expanded?: boolean
  onToggle?: () => void
}

export function BSONNode({ name, value, level = 0, expanded: controlledExpanded, onToggle }: BSONNodeProps) {
  const [internalExpanded, setInternalExpanded] = useState(true)
  const isControlled = controlledExpanded !== undefined
  const expanded = isControlled ? controlledExpanded : internalExpanded

  const formatted = formatBSONValue(value)
  const isExpandable = formatted.type === "Object" || formatted.type === "Array"

  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle()
    } else {
      setInternalExpanded(!internalExpanded)
    }
  }

  const indentStyle = {
    paddingLeft: `${level * 6}px`
  }

  return (
    <div className="bson-node" style={indentStyle}>
      <div className="flex items-center gap-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
        {isExpandable && (
          <button
            onClick={handleToggle}
            className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "▼" : "▶"}
          </button>
        )}
        {!isExpandable && <span className="w-4" />}
        <span className="font-semibold text-blue-600 dark:text-blue-400">{name}:</span>
        <span className={getTypeColorClass(formatted.type)}>
          {formatted.display}
        </span>
      </div>
      {isExpandable && expanded && (
        <div className="ml-4">
          {formatted.type === "Array" ? (
            <div>
              {formatted.value.map((item: any, index: number) => (
                <BSONNode key={index} name={`[${index}]`} value={item} level={level + 1} />
              ))}
            </div>
          ) : (
            <div>
              {Object.entries(formatted.value).map(([key, val]) => (
                <BSONNode key={key} name={key} value={val} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getTypeColorClass(type: string): string {
  switch (type) {
    case "string":
      return "text-green-600 dark:text-green-400"
    case "number":
      return "text-blue-600 dark:text-blue-400"
    case "boolean":
      return "text-purple-600 dark:text-purple-400"
    case "null":
    case "undefined":
      return "text-gray-600 dark:text-gray-400"
    case "ObjectId":
    case "Date":
    case "Binary":
    case "RegExp":
      return "text-orange-600 dark:text-orange-400"
    default:
      return "text-gray-600 dark:text-gray-400"
  }
}

