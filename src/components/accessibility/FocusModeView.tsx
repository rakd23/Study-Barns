import { useAccessibility } from '../../accessibility/AccessibilityContext'
import {
  getEarliestAssignment,
  getFocusMessage,
  getFocusRecommendation,
} from '../../accessibility/focusMode'
import { getBlockVisualStyle } from '../../accessibility/blockVisuals'
import { BlockTypeIcon } from './BlockTypeIcon'
import type { CalendarBlock } from '../../types'
import { BLOCK_BORDER_RADIUS_PX } from '../../utils/time'

interface FocusModeViewProps {
  rightBlocks: CalendarBlock[]
  onBook: (block: CalendarBlock) => void
}

export function FocusModeView({ rightBlocks, onBook }: FocusModeViewProps) {
  const { settings, focusPanelExpanded, setFocusPanelExpanded } =
    useAccessibility()

  const assignment = getEarliestAssignment()
  const recommendation =
    getFocusRecommendation(rightBlocks) ?? getFocusRecommendation()
  const message = getFocusMessage(assignment)

  if (!recommendation) return null

  const visual = getBlockVisualStyle(recommendation.color, settings)
  const highContrastBorder = settings.highContrast
    ? 'border-2 border-black'
    : visual.border

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white p-6">
      <p className="text-sm text-gray-600">{message}</p>
      <div
        className={`relative mt-4 overflow-hidden border p-4 shadow-md ${visual.bg} ${highContrastBorder} ${settings.highContrast ? 'font-bold text-white' : visual.text}`}
        style={{ borderRadius: BLOCK_BORDER_RADIUS_PX }}
      >
        {visual.pattern && (
          <div
            className={`pointer-events-none absolute inset-0 opacity-30 ${visual.pattern}`}
            aria-hidden
          />
        )}
        <div className="relative flex items-start gap-2">
          {visual.iconKey && (
            <BlockTypeIcon iconKey={visual.iconKey} className="mt-0.5 h-5 w-5" />
          )}
          <div>
            <p className="text-lg font-semibold">{recommendation.label}</p>
            {recommendation.sublabel && (
              <p
                className={
                  settings.highContrast ? 'text-white' : visual.subtext
                }
              >
                {recommendation.sublabel}
              </p>
            )}
            {recommendation.location && (
              <p className="mt-1 text-sm opacity-90">{recommendation.location}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onBook(recommendation)}
          className="a11y-focusable relative mt-4 rounded bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90"
        >
          Book session
        </button>
      </div>

      {!focusPanelExpanded && (
        <button
          type="button"
          onClick={() => setFocusPanelExpanded(true)}
          className="a11y-focusable mt-6 text-sm font-medium text-navy underline hover:text-gold"
        >
          Show all
        </button>
      )}
    </div>
  )
}
