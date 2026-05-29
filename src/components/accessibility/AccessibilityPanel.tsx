import { Accessibility, Volume2, X } from 'lucide-react'
import { useRef } from 'react'
import { useAccessibility } from '../../accessibility/AccessibilityContext'
import type { AccessibilitySettingKey } from '../../accessibility/types'
import type { TextSize } from '../../accessibility/types'

const OPTIONS: {
  key: Exclude<AccessibilitySettingKey, 'textSize'>
  title: string
  description: string
  note?: string
}[] = [
  {
    key: 'highContrast',
    title: 'High Contrast',
    description: 'Bold text and 2px black borders on all blocks',
  },
  {
    key: 'colorBlind',
    title: 'Color Blind Mode',
    description: 'Adds shape icons inside each calendar block',
  },
  {
    key: 'darkMode',
    title: 'Dark Mode',
    description: 'Dark background across the entire app',
  },
  {
    key: 'focusMode',
    title: 'Focus Mode',
    description: 'Collapses right panel to show only one card',
  },
  {
    key: 'simplifiedView',
    title: 'Simplified View',
    description: 'Replaces calendar grid with two vertical lists',
  },
  {
    key: 'announceBlocks',
    title: 'Announce Blocks',
    description: 'Reads block details aloud when you click them',
    note: 'Uses your device speech synthesis',
  },
]

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
        on ? 'bg-gold' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export function AccessibilityPanel() {
  const {
    panelOpen,
    setPanelOpen,
    settings,
    toggleSetting,
    setTextSize,
  } = useAccessibility()

  // Live region ref for announcing blocks
  const liveRef = useRef<HTMLDivElement>(null)

  const textSizes: { size: TextSize; label: string }[] = [
    { size: 'small', label: 'Small' },
    { size: 'medium', label: 'Medium' },
    { size: 'large', label: 'Large' },
  ]

  const testAnnounce = () => {
    const msg = 'Announce Blocks is on. Click any calendar block to hear its details.'
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(msg)
      window.speechSynthesis.speak(utt)
    }
    if (liveRef.current) {
      liveRef.current.textContent = ''
      setTimeout(() => {
        if (liveRef.current) liveRef.current.textContent = msg
      }, 50)
    }
  }

  return (
    <>
      {panelOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30"
          aria-label="Close accessibility panel"
          onClick={() => setPanelOpen(false)}
        />
      )}

      {/* Screen-reader live region */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <aside
        id="accessibility-panel"
        aria-hidden={!panelOpen}
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-navy" aria-hidden />
            <h2 className="text-base font-semibold text-navy">Accessibility Options</h2>
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">

          {/* Text size */}
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Text Size
            </p>
            <div className="flex gap-2">
              {textSizes.map(({ size, label }) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTextSize(size)}
                  aria-pressed={settings.textSize === size}
                  className={`flex-1 rounded border px-3 py-2 font-medium transition-colors duration-150 ${
                    size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'
                  } ${
                    settings.textSize === size
                      ? 'border-gold bg-gold text-navy'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Changes text size across the entire app instantly.
            </p>
          </div>

          {/* Display options */}
          <div className="space-y-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Display Options
            </p>
            {OPTIONS.map(({ key, title, description, note }) => (
              <div
                key={key}
                className={`flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors duration-150 ${
                  settings[key] ? 'bg-gold/10' : 'hover:bg-gray-50'
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${settings[key] ? 'text-navy' : 'text-gray-900'}`}>
                    {title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                  {note && (
                    <p className="mt-0.5 text-xs text-gray-400 italic">{note}</p>
                  )}
                  {/* Announce blocks: show test button when on */}
                  {key === 'announceBlocks' && settings.announceBlocks && (
                    <button
                      type="button"
                      onClick={testAnnounce}
                      className="mt-1.5 flex items-center gap-1 rounded bg-navy px-2 py-1 text-xs text-white hover:bg-navy/80"
                    >
                      <Volume2 className="h-3 w-3" />
                      Test voice
                    </button>
                  )}
                </div>
                <Toggle
                  on={settings[key] as boolean}
                  onChange={() => toggleSetting(key)}
                  label={`Toggle ${title}`}
                />
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
