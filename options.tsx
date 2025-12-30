import { useEffect, useState } from "react"
import { getSettings, saveSettings, type ViewerSettings } from "~/utils/storage"
import "~/style.css"

function Options() {
  const [settings, setSettings] = useState<ViewerSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const handleSave = async () => {
    if (settings) {
      await saveSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">BSON Viewer Settings</h1>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoIntercept}
                onChange={(e) => setSettings({ ...settings, autoIntercept: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Auto-intercept BSON files</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically open BSON files in the viewer instead of downloading them
                </div>
              </div>
            </label>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <label className="block mb-2">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">File Size Limit (MB)</div>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.fileSizeLimit}
                onChange={(e) => setSettings({ ...settings, fileSizeLimit: parseInt(e.target.value) || 10 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Files larger than this will show a warning
              </div>
            </label>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <label className="block mb-2">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Theme</div>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value as "light" | "dark" })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <label className="block mb-2">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Default Expand Level</div>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.expandLevel}
                onChange={(e) => setSettings({ ...settings, expandLevel: parseInt(e.target.value) || 2 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                How many levels to expand by default in the tree view
              </div>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {saved ? "✓ Saved" : "Save Settings"}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Options

