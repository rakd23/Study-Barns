import { Accessibility, X } from 'lucide-react'
import { useAccessibility } from '../../accessibility/AccessibilityContext'
import type { TextSize } from '../../accessibility/types'

const OPTIONS: {
  key: Exclude<import('../../accessibility/types').AccessibilitySettingKey, 'textSize'>
  title: string
  description: string
}[] = [
  {
    key: 'highContrast',
    title: 'High Contrast Mode',
    description: 'Makes all text bold and borders 2px black',
  },
  {
    key: 'colorBlind',
    title: 'Color Blind Mode',
    description: 'Adds icons inside each calendar block',
  },
  {
    key: 'reducedMotion',
    title: 'Reduced Motion Mode',
    description: 'Removes all CSS transitions and animations',
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
    key: 'keyboardNav',
    title: 'Keyboard Navigation Mode',
    description: 'Shows blue focus ring on all interactive elements',
  },
  {
    key: 'screenReader',
    title: 'Screen Reader Mode',
    description: 'Adds aria-labels to all blocks for VoiceOver/NVDA',
  },
]

function Toggle({
  on,
  onChange,
  reducedMotion,
  label,
}: {
  on: boolean
  onChange: () => void
  reducedMotion: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-transparent ${
        reducedMotion ? '' : 'transition-colors duration-200'
      } ${on ? 'bg-gold' : 'bg-gray-300'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow ${
          reducedMotion ? '' : 'transition-transform duration-200'
        } ${on ? 'translate-x-5' : 'translate-x-0'}`}
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
    reducedMotion,
  } = useAccessibility()

  const textSizes: { size: TextSize; label: string }[] = [
    { size: 'small', label: 'Small' },
    { size: 'medium', label: 'Medium' },
    { size: 'large', label: 'Large' },
  ]

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

      <aside
        id="accessibility-panel"
        aria-hidden={!panelOpen}
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl ${
          reducedMotion ? '' : 'transition-transform duration-300 ease-out'
        } ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}
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
                  className={`flex-1 rounded border px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    settings.textSize === size
                      ? 'border-gold bg-gold text-navy'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Display Options
            </p>
            {OPTIONS.map(({ key, title, description }) => (
              <div
                key={key}
                className={`flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors duration-150 ${
                  settings[key] ? 'bg-gold/10' : 'hover:bg-gray-50'
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      settings[key] ? 'text-navy' : 'text-gray-900'
                    }`}
                  >
                    {title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                </div>
                <Toggle
                  on={settings[key] as boolean}
                  onChange={() => toggleSetting(key)}
                  reducedMotion={reducedMotion}
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
