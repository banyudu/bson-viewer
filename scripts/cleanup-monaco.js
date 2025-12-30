#!/usr/bin/env node
/**
 * Post-build script to remove unnecessary Monaco Editor files
 * Only keeps JSON worker and related files, removes all other language workers and modes
 */

const fs = require("fs")
const path = require("path")

const BUILD_DIR = path.join(process.cwd(), "build", "chrome-mv3-prod")

// Monaco workers to keep (only JSON)
const WORKERS_TO_KEEP = ["json.worker"]

// Monaco language modes to keep (only JSON)
const MODES_TO_KEEP = ["jsonMode", "cssMode"]

// Monaco language files to keep (only JSON-related)
const LANGUAGES_TO_KEEP = ["json"]

/**
 * Get all files in a directory matching a pattern
 */
function getFiles(dir, pattern) {
  const files = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isFile() && pattern.test(entry.name)) {
        files.push(entry.name)
      }
    }
  } catch (error) {
    // Directory might not exist or be readable
  }
  return files
}

/**
 * Remove files matching patterns we don't need
 */
function cleanupMonacoFiles() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.log(`Build directory not found: ${BUILD_DIR}`)
    return
  }

  console.log("Cleaning up unnecessary Monaco Editor files...")

  // Find all Monaco worker files
  const workerFiles = getFiles(BUILD_DIR, /\.worker\..*\.js$/)
  let removedWorkers = 0

  for (const file of workerFiles) {
    const shouldKeep = WORKERS_TO_KEEP.some((keep) => file.includes(keep))
    if (!shouldKeep) {
      const filePath = path.join(BUILD_DIR, file)
      fs.unlinkSync(filePath)
      removedWorkers++
      console.log(`  Removed worker: ${file}`)
    }
  }

  // Find all Monaco mode files
  const modeFiles = getFiles(BUILD_DIR, /Mode\./)
  let removedModes = 0

  for (const file of modeFiles) {
    const shouldKeep = MODES_TO_KEEP.some((keep) => file.includes(keep))
    if (!shouldKeep) {
      const filePath = path.join(BUILD_DIR, file)
      fs.unlinkSync(filePath)
      removedModes++
      console.log(`  Removed mode: ${file}`)
    }
  }

  // Find all Monaco language files (abap.js, apex.js, etc.)
  // These are language definition files that we don't need
  const allJsFiles = getFiles(BUILD_DIR, /\.js$/)
  let removedLanguages = 0

  // Monaco language files are typically lowercase and don't contain "worker", "Mode", or common prefixes
  const knownMonacoLanguages = [
    "abap",
    "apex",
    "azcli",
    "bat",
    "bicep",
    "cameligo",
    "clojure",
    "coffee",
    "cpp",
    "csharp",
    "csp",
    "css",
    "cypher",
    "dart",
    "dockerfile",
    "ecl",
    "elixir",
    "flow9",
    "freemarker2",
    "fsharp",
    "go",
    "graphql",
    "handlebars",
    "hcl",
    "html",
    "ini",
    "java",
    "javascript",
    "julia",
    "kotlin",
    "less",
    "lexon",
    "liquid",
    "lua",
    "m3",
    "markdown",
    "mdx",
    "mips",
    "msdax",
    "mysql",
    "objective-c",
    "pascal",
    "pascaligo",
    "perl",
    "pgsql",
    "php",
    "pla",
    "postiats",
    "powerquery",
    "powershell",
    "protobuf",
    "pug",
    "python",
    "qsharp",
    "r",
    "razor",
    "redis",
    "redshift",
    "restructuredtext",
    "ruby",
    "rust",
    "sb",
    "scala",
    "scheme",
    "scss",
    "shell",
    "solidity",
    "sophia",
    "sparql",
    "sql",
    "st",
    "swift",
    "systemverilog",
    "tcl",
    "twig",
    "typescript",
    "typespec",
    "vb",
    "wgsl",
    "xml",
    "yaml",
  ]

  for (const file of allJsFiles) {
    // Skip files that are not Monaco language files
    if (
      file.includes("worker") ||
      file.includes("Mode") ||
      file.includes("options") ||
      file.includes("tabs") ||
      file.includes("static") ||
      file.includes("background")
    ) {
      continue
    }

    // Check if this is a Monaco language file we should remove
    const baseName = path.basename(file, ".js").split(".")[0] // Get base name before hash
    if (
      knownMonacoLanguages.includes(baseName) &&
      !LANGUAGES_TO_KEEP.includes(baseName)
    ) {
      const filePath = path.join(BUILD_DIR, file)
      // Make sure it's actually a file and not a directory
      try {
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath)
          removedLanguages++
          console.log(`  Removed language: ${file}`)
        }
      } catch (error) {
        // File might have been deleted or doesn't exist
      }
    }
  }

  console.log(
    `\nCleanup complete! Removed ${removedWorkers} workers, ${removedModes} modes, and ${removedLanguages} language files.`
  )
  console.log(`Kept only JSON-related Monaco files.`)
}

try {
  cleanupMonacoFiles()
} catch (error) {
  console.error("Error cleaning up Monaco files:", error)
  process.exit(1)
}

