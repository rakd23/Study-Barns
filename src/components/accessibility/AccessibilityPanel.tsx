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
    description: 'Increases contrast for low vision',
  },
  {
    key: 'colorBlind',
    title: 'Color Blind Mode',
    description: 'Replaces color coding with patterns and icons',
  },
  {
    key: 'reducedMotion',
    title: 'Reduced Motion Mode',
    description: 'Removes animations for motion sensitivity',
  },
  {
    key: 'focusMode',
    title: 'Focus Mode',
    description: 'Show only your most urgent support resource',
  },
  {
    key: 'simplifiedView',
    title: 'Simplified View',
    description: 'Switch to a list view instead of calendar grid',
  },
  {
    key: 'keyboardNav',
    title: 'Keyboard Navigation Mode',
    description: 'Navigate everything with tab and arrow keys',
  },
  {
    key: 'screenReader',
    title: 'Screen Reader Mode',
    description: 'Optimized labels for VoiceOver and NVDA',
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
      } ${on ? 'bg-navy' : 'bg-gray-300'}`}
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

  const textSizes: { size: TextSize; className: string; label: string }[] = [
    { size: 'small', className: 'text-xs', label: 'Small text' },
    { size: 'medium', className: 'text-sm', label: 'Medium text' },
    { size: 'large', className: 'text-base', label: 'Large text' },
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
        } ${panelOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-navy px-5 py-4">
          <div className="flex items-center gap-2 text-white">
            <Accessibility className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Accessibility Options</h2>
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="rounded p-1 text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {OPTIONS.map(({ key, title, description }) => (
              <div
                key={key}
                className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy">{title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                </div>
                <Toggle
                  on={settings[key]}
                  onChange={() => toggleSetting(key)}
                  reducedMotion={reducedMotion}
                  label={title}
                />
              </div>
            ))}

            <div className="border-b border-gray-100 pb-4">
              <p className="font-medium text-navy">Text Size</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Adjust text size across the app
              </p>
              <div className="mt-3 flex gap-2">
                {textSizes.map(({ size, className, label }) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTextSize(size)}
                    aria-pressed={settings.textSize === size}
                    aria-label={label}
                    className={`flex flex-1 items-center justify-center rounded border-2 py-2 font-bold text-navy ${
                      reducedMotion ? '' : 'transition-all duration-200'
                    } ${
                      settings.textSize === size
                        ? 'border-gold bg-gold/20'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${className}`}
                  >
                    A
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
