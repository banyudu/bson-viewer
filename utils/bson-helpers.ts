import { BSON, ObjectId } from "bson"

export interface BSONValue {
  type: string
  value: any
  display: string
}

/**
 * Parse BSON binary data to JavaScript object
 */
export function parseBSON(data: Uint8Array | ArrayBuffer): any {
  try {
    const buffer = data instanceof ArrayBuffer ? new Uint8Array(data) : data
    return BSON.deserialize(buffer)
  } catch (error) {
    throw new Error(`Failed to parse BSON: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Serialize JavaScript object back to BSON binary format
 */
export function serializeBSON(obj: any): Uint8Array {
  try {
    return BSON.serialize(obj)
  } catch (error) {
    throw new Error(`Failed to serialize BSON: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Generate a JSON preview for objects and arrays (for collapsed display)
 */
function generateJSONPreview(value: any, maxItems: number = 3): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]"
    }
    const preview = value.slice(0, maxItems).map(item => {
      if (typeof item === "string") {
        const escaped = item
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t")
        return `"${escaped}"`
      }
      if (typeof item === "object" && item !== null) {
        return Array.isArray(item) ? "[...]" : "{...}"
      }
      return JSON.stringify(item)
    })
    const suffix = value.length > maxItems ? ", ..." : ""
    return `[${preview.join(", ")}${suffix}]`
  }

  if (typeof value === "object" && value !== null) {
    const keys = Object.keys(value)
    if (keys.length === 0) {
      return "{}"
    }
    const preview: string[] = []
    for (let i = 0; i < Math.min(maxItems, keys.length); i++) {
      const key = keys[i]
      const val = value[key]
      const keyStr = `"${key.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
      
      let valStr: string
      if (typeof val === "string") {
        const escaped = val
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t")
        valStr = `"${escaped}"`
      } else if (typeof val === "object" && val !== null) {
        valStr = Array.isArray(val) ? "[...]" : "{...}"
      } else {
        valStr = JSON.stringify(val)
      }
      
      preview.push(`${keyStr}: ${valStr}`)
    }
    const suffix = keys.length > maxItems ? ", ..." : ""
    return `{${preview.join(", ")}${suffix}}`
  }

  return ""
}

/**
 * Convert BSON value to display-friendly format with proper JSON formatting
 */
export function formatBSONValue(value: any): BSONValue {
  if (value === null) {
    return { type: "null", value: null, display: "null" }
  }

  if (value === undefined) {
    return { type: "undefined", value: undefined, display: "undefined" }
  }

  // Handle BSON ObjectId
  if (value instanceof ObjectId) {
    return {
      type: "ObjectId",
      value: value.toString(),
      display: `ObjectId("${value.toString()}")`
    }
  }

  // Handle Date
  if (value instanceof Date) {
    return {
      type: "Date",
      value: value.toISOString(),
      display: `ISODate("${value.toISOString()}")`
    }
  }

  // Handle Binary
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
    const bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : value
    return {
      type: "Binary",
      value: Array.from(bytes),
      display: `BinData(${bytes.length})`
    }
  }

  // Handle RegExp
  if (value instanceof RegExp) {
    return {
      type: "RegExp",
      value: value.toString(),
      display: value.toString()
    }
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return {
      type: "Array",
      value: value,
      display: generateJSONPreview(value)
    }
  }

  // Handle objects
  if (typeof value === "object") {
    return {
      type: "Object",
      value: value,
      display: generateJSONPreview(value)
    }
  }

  // Handle primitives with proper JSON formatting
  if (typeof value === "string") {
    // Escape quotes and special characters for JSON display
    const escaped = value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
    return {
      type: "string",
      value: value,
      display: `"${escaped}"`
    }
  }

  if (typeof value === "boolean") {
    return {
      type: "boolean",
      value: value,
      display: String(value)
    }
  }

  if (typeof value === "number") {
    return {
      type: "number",
      value: value,
      display: String(value)
    }
  }

  // Fallback for other types
  return {
    type: typeof value,
    value: value,
    display: JSON.stringify(value)
  }
}

/**
 * Convert parsed BSON object to JSON string with formatting
 */
export function bsonToJSON(obj: any, pretty: boolean = true): string {
  // Convert BSON-specific types to JSON-compatible format
  const jsonObj = convertBSONToJSON(obj)
  return pretty ? JSON.stringify(jsonObj, null, 2) : JSON.stringify(jsonObj)
}

/**
 * Recursively convert BSON types to JSON-compatible types
 */
function convertBSONToJSON(value: any): any {
  if (value === null || value === undefined) {
    return value
  }

  // Handle ObjectId
  if (value instanceof ObjectId) {
    return { $oid: value.toString() }
  }

  // Handle Date
  if (value instanceof Date) {
    return { $date: value.toISOString() }
  }

  // Handle Binary
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
    const bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : value
    return {
      $binary: {
        base64: btoa(String.fromCharCode(...bytes)),
        subType: "00"
      }
    }
  }

  // Handle RegExp
  if (value instanceof RegExp) {
    return {
      $regex: value.source,
      $options: value.flags
    }
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(convertBSONToJSON)
  }

  // Handle objects
  if (typeof value === "object") {
    const result: Record<string, any> = {}
    for (const [key, val] of Object.entries(value)) {
      result[key] = convertBSONToJSON(val)
    }
    return result
  }

  // Return primitives as-is
  return value
}

