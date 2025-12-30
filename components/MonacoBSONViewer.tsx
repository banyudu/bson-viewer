import Editor from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { bsonToJSON } from "~/utils/bson-helpers"

interface MonacoBSONViewerProps {
  data: any
  theme?: string
  onEditorReady?: (editor: editor.IStandaloneCodeEditor) => void
}

export function MonacoBSONViewer({ data, theme = "vs", onEditorReady }: MonacoBSONViewerProps) {
  // Convert BSON data to formatted JSON
  const jsonString = bsonToJSON(data, true)

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    onEditorReady?.(editor)
  }

  return (
    <div className="monaco-bson-viewer h-full">
      <Editor
        height="100%"
        defaultLanguage="json"
        value={jsonString}
        theme={theme}
        options={{
          readOnly: true,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: "on",
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          formatOnPaste: false,
          formatOnType: false,
          tabSize: 2,
          folding: true,
          bracketPairColorization: { enabled: true },
          renderWhitespace: "selection",
          cursorBlinking: "smooth",
          smoothScrolling: true,
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  )
}

