import { Accessibility, Ghost } from 'lucide-react'
import { useAccessibility } from '../accessibility/AccessibilityContext'

export function HeaderControls() {
  const { panelOpen, setPanelOpen, incognito, setIncognito } = useAccessibility()

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={incognito}
        onClick={() => setIncognito(!incognito)}
        className={`a11y-focusable flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-colors duration-200 ${
          incognito
            ? 'border-white/40 bg-white/20 font-semibold text-white'
            : 'border-white/20 text-white hover:bg-white/10'
        }`}
      >
        <Ghost className="h-3.5 w-3.5" aria-hidden />
        <span>Incognito</span>
      </button>

      <button
        type="button"
        onClick={() => setPanelOpen(!panelOpen)}
        aria-expanded={panelOpen}
        aria-controls="accessibility-panel"
        className="a11y-focusable flex items-center gap-1.5 rounded border border-gold/50 bg-gold/10 px-2.5 py-1.5 text-xs font-medium text-gold transition-colors duration-200 hover:bg-gold/20"
      >
        <Accessibility className="h-4 w-4" aria-hidden />
        Accessibility
      </button>
    </div>
  )
}
