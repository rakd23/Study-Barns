import { Check, Star, Users } from 'lucide-react'
import { useAccessibility } from '../accessibility/AccessibilityContext'
import { getBlockAriaLabel } from '../accessibility/ariaLabels'
import { getBlockVisualStyle } from '../accessibility/blockVisuals'
import { BlockTypeIcon } from './accessibility/BlockTypeIcon'
import type { CalendarBlock } from '../types'
import { BLOCK_BORDER_RADIUS_PX, durationRows, timeToRow } from '../utils/time'

interface EventBlockProps {
  block: CalendarBlock
  confirmed: boolean
  starRating?: number
  onClick?: () => void
  onMemberJoin?: () => void
  incognito?: boolean
}

const blockRadiusStyle = { borderRadius: BLOCK_BORDER_RADIUS_PX }

// Darker versions of each color for incognito mode
const INCOGNITO_BLOCK_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  ecs: { bg: 'bg-blue-900/70', border: 'border-blue-700', text: 'text-blue-200' },
  bis: { bg: 'bg-green-900/70', border: 'border-green-700', text: 'text-green-200' },
  psc: { bg: 'bg-purple-900/70', border: 'border-purple-700', text: 'text-purple-200' },
  assignment: { bg: 'bg-pink-900/70', border: 'border-pink-700', text: 'text-pink-200' },
  aatc: { bg: 'bg-teal-900/70', border: 'border-teal-700', text: 'text-teal-200' },
  oh: { bg: 'bg-orange-900/70', border: 'border-orange-700', text: 'text-orange-200' },
  'oh-reminder': { bg: 'bg-orange-900/50', border: 'border-orange-800', text: 'text-orange-300' },
  ta: { bg: 'bg-yellow-900/70', border: 'border-yellow-700', text: 'text-yellow-200' },
  study: { bg: 'bg-rose-900/70', border: 'border-rose-700', text: 'text-rose-200' },
}

export function EventBlock({
  block,
  confirmed,
  starRating,
  onClick,
  onMemberJoin,
  incognito = false,
}: EventBlockProps) {
  const { settings, reducedMotion } = useAccessibility()
  const visual = getBlockVisualStyle(block.color, settings)
  const row = timeToRow(block.startHour, block.startMinute)
  const span = durationRows(
    block.startHour,
    block.startMinute,
    block.endHour,
    block.endMinute,
  )

  const highContrast = settings.highContrast
  const motionClass = reducedMotion ? '' : 'transition-all duration-200'

  // Determine styling based on incognito / high contrast
  const blockStyle = incognito
    ? INCOGNITO_BLOCK_STYLES[block.color] ?? INCOGNITO_BLOCK_STYLES.ecs
    : null

  const bgClass = blockStyle ? blockStyle.bg : visual.bg
  const borderClass = highContrast
    ? 'border-2 border-black'
    : blockStyle
      ? `border ${blockStyle.border}`
      : `border ${visual.border}`
  const textClass = blockStyle ? blockStyle.text : visual.text
  const fontWeight = highContrast ? 'font-bold' : ''
  const subtextClass = blockStyle
    ? `${blockStyle.text} opacity-70`
    : highContrast
      ? 'text-black'
      : `${visual.subtext} opacity-80`

  const baseClass = `a11y-focusable absolute left-0.5 right-0.5 z-10 overflow-hidden px-1.5 py-1 text-left text-[11px] leading-snug shadow-sm ${motionClass} ${bgClass} ${borderClass} ${textClass} ${fontWeight} ${
    block.clickable
      ? `cursor-pointer ${reducedMotion ? '' : 'hover:brightness-110 hover:shadow-md'}`
      : 'cursor-default'
  }`

  const ariaLabel = settings.screenReader ? getBlockAriaLabel(block) : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!block.clickable && !onMemberJoin && !block.memberCount}
      className={baseClass}
      style={{
        gridRow: `${row + 1} / span ${span}`,
        ...blockRadiusStyle,
      }}
      aria-label={ariaLabel}
    >
      {visual.pattern && !incognito && (
        <div
          className={`pointer-events-none absolute inset-0 ${visual.pattern}`}
          aria-hidden
        />
      )}
      <div className="relative flex items-start gap-1">
        {visual.iconKey && (
          <BlockTypeIcon iconKey={visual.iconKey} className="mt-0.5 h-3 w-3 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{block.label}</div>
          {block.sublabel && (
            <div className={`truncate ${subtextClass}`}>{block.sublabel}</div>
          )}
        </div>
      </div>
      {block.memberCount && (
        <MemberBadge
          count={block.memberCount}
          onJoin={!block.clickable ? onMemberJoin : undefined}
          confirmed={confirmed}
          starRating={starRating}
          reducedMotion={reducedMotion}
          incognito={incognito}
        />
      )}
    </button>
  )
}

function MemberBadge({
  count,
  onJoin,
  confirmed,
  starRating,
  reducedMotion,
  incognito,
}: {
  count: { filled: number; max: number }
  onJoin?: () => void
  confirmed: boolean
  starRating?: number
  reducedMotion: boolean
  incognito?: boolean
}) {
  const isFull = count.filled >= count.max
  const hasRating = starRating !== undefined && starRating > 0

  return (
    <div className="mt-1 flex items-center gap-1">
      {hasRating && (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: starRating }).map((_, i) => (
            <Star key={i} className="h-2.5 w-2.5 fill-current text-gold" />
          ))}
        </div>
      )}
      <div
        className={`flex items-center gap-0.5 text-[10px] ${
          isFull
            ? incognito ? 'text-gray-400' : 'text-gray-400'
            : incognito ? 'text-teal-300' : 'text-teal-700'
        }`}
      >
        <Users className="h-2.5 w-2.5" />
        <span>
          {count.filled}/{count.max}
        </span>
      </div>
      {confirmed && (
        <Check className={`h-3 w-3 ${incognito ? 'text-green-400' : 'text-green-600'}`} />
      )}
      {onJoin && !isFull && !confirmed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onJoin()
          }}
          className={`rounded px-1 py-0.5 text-[9px] font-medium ${
            reducedMotion ? '' : 'transition-colors duration-150'
          } ${
            incognito
              ? 'bg-teal-700/50 text-teal-200 hover:bg-teal-700'
              : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
          }`}
        >
          Join
        </button>
      )}
    </div>
  )
}
