import type { CalendarBlock, DayKey } from '../types'
import { EventBlock } from './EventBlock'

interface CalendarDayColumnProps {
  day: DayKey
  blocks: CalendarBlock[]
  rows: number
  rowHeightPx: number
  confirmedIds: Set<string>
  starRatings: Record<string, number>
  onBlockClick?: (block: CalendarBlock) => void
  onMemberJoin?: (blockId: string) => void
  className?: string
  style?: React.CSSProperties
  incognito?: boolean
}

export function CalendarDayColumn({
  day,
  blocks,
  rows,
  rowHeightPx,
  confirmedIds,
  starRatings,
  onBlockClick,
  onMemberJoin,
  className = '',
  style,
  incognito = false,
}: CalendarDayColumnProps) {
  const dayBlocks = blocks.filter((b) => b.days.includes(day))

  const borderColor = incognito ? 'border-white/5' : 'border-gray-100'
  const evenColor = incognito ? 'border-white/5' : 'border-gray-100'
  const oddColor = incognito ? 'border-white/[0.03]' : 'border-gray-50'

  return (
    <div
      className={`relative border-l transition-colors duration-300 ${borderColor} ${className}`}
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, ${rowHeightPx}px)`,
        ...style,
      }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`border-b transition-colors duration-300 ${
            i % 2 === 0 ? evenColor : oddColor
          }`}
        />
      ))}

      {dayBlocks.map((block) => (
        <EventBlock
          key={`${block.id}-${day}`}
          block={block}
          confirmed={confirmedIds.has(block.id)}
          starRating={
            block.organizer ? starRatings[block.organizer] : undefined
          }
          onClick={block.clickable ? () => onBlockClick?.(block) : undefined}
          onMemberJoin={
            onMemberJoin ? () => onMemberJoin(block.id) : undefined
          }
          incognito={incognito}
        />
      ))}
    </div>
  )
}
