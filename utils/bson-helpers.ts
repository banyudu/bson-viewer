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
 * Convert BSON value to display-friendly format
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
      display: `[${value.length} items]`
    }
  }

  // Handle objects
  if (typeof value === "object") {
    const keys = Object.keys(value)
    return {
      type: "Object",
      value: value,
      display: `{${keys.length} ${keys.length === 1 ? "key" : "keys"}}`
    }
  }

  // Handle primitives
  return {
    type: typeof value,
    value: value,
    display: String(value)
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

