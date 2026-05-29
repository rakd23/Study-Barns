import { Accessibility, Eye, EyeOff } from 'lucide-react'
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
        className="a11y-focusable flex items-center gap-1.5 rounded border border-white/20 px-2.5 py-1.5 text-xs text-white transition-colors duration-200 hover:bg-white/10"
      >
        {incognito ? (
          <EyeOff className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Eye className="h-3.5 w-3.5" aria-hidden />
        )}
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
