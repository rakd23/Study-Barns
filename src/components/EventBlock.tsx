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
}

const blockRadiusStyle = { borderRadius: BLOCK_BORDER_RADIUS_PX }

export function EventBlock({
  block,
  confirmed,
  starRating,
  onClick,
  onMemberJoin,
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
  const borderClass = highContrast ? 'border-2 border-black' : visual.border
  const fontWeight = highContrast ? 'font-bold' : ''
  const subtextClass = highContrast ? 'text-black' : `${visual.subtext} opacity-80`

  const motionClass = reducedMotion ? '' : 'transition-all duration-200'

  const baseClass = `a11y-focusable absolute left-0.5 right-0.5 z-10 overflow-hidden border px-1.5 py-1 text-left text-[11px] leading-snug shadow-sm ${motionClass} ${visual.bg} ${borderClass} ${visual.text} ${fontWeight} ${
    block.clickable
      ? `cursor-pointer ${reducedMotion ? '' : 'hover:brightness-95 hover:shadow-md'}`
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
      {visual.pattern && (
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
          reducedMotion={reducedMotion}
          highContrast={highContrast}
        />
      )}
      {confirmed && <ConfirmedBadge />}
      {starRating != null && starRating > 0 && (
        <StarBadge rating={starRating} highContrast={highContrast} />
      )}
    </button>
  )
}

function MemberBadge({
  count,
  onJoin,
  reducedMotion,
  highContrast,
}: {
  count: { filled: number; max: number }
  onJoin?: () => void
  reducedMotion: boolean
  highContrast: boolean
}) {
  const full = count.filled >= count.max
  const label =
    count.filled === 1 && count.max > 1
      ? `1 of ${count.max} spots filled`
      : `${count.filled}/${count.max}`

  const badgeClass = `absolute right-1 top-1 flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-medium shadow-sm ${
    highContrast
      ? 'border-2 border-black bg-white text-black font-bold'
      : 'bg-white/90 text-navy'
  } ${reducedMotion ? '' : 'transition-all duration-200'}`

  if (onJoin && !full) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onJoin()
        }}
        className={`a11y-focusable ${badgeClass} hover:bg-gold/30`}
        title="Join session"
      >
        <Users className="h-2.5 w-2.5" />
        {label}
      </button>
    )
  }

  return (
    <span className={badgeClass}>
      <Users className="h-2.5 w-2.5" />
      {label}
    </span>
  )
}

function ConfirmedBadge() {
  return (
    <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white shadow">
      <Check className="h-2.5 w-2.5" strokeWidth={3} />
    </span>
  )
}

function StarBadge({
  rating,
  highContrast,
}: {
  rating: number
  highContrast: boolean
}) {
  return (
    <span
      className={`absolute bottom-1 left-1 flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-bold shadow ${
        highContrast
          ? 'border-2 border-black bg-white text-black'
          : 'bg-gold text-navy'
      }`}
    >
      <Star
        className={`h-2.5 w-2.5 ${highContrast ? 'fill-black text-black' : 'fill-navy text-navy'}`}
      />
      {rating}
    </span>
  )
}
