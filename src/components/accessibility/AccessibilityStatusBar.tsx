import { X } from 'lucide-react'
import { useAccessibility } from '../../accessibility/AccessibilityContext'
import type { AccessibilitySettingKey } from '../../accessibility/types'

export function AccessibilityStatusBar() {
  const { activeSettingLabels, setSetting, toggleSetting } = useAccessibility()

  if (activeSettingLabels.length === 0) return null

  const dismiss = (
    key: Exclude<AccessibilitySettingKey, 'textSize'> | 'textSize',
  ) => {
    if (key === 'textSize') {
      setSetting('textSize', 'medium')
      return
    }
    toggleSetting(key)
  }

  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gold/30 bg-amber-50 px-4 py-2"
      role="status"
      aria-live="polite"
    >
      <span className="text-xs font-medium text-navy">Accessibility:</span>
      {activeSettingLabels.map(({ key, label }) => (
        <span
          key={`${key}-${label}`}
          className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-white px-2 py-0.5 text-xs font-medium text-navy"
        >
          {label}
          <button
            type="button"
            onClick={() => dismiss(key)}
            className="rounded-full p-0.5 hover:bg-gold/20"
            aria-label={`Turn off ${label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )
}
