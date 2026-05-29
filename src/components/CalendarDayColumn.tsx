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
}: CalendarDayColumnProps) {
  const dayBlocks = blocks.filter((b) => b.days.includes(day))

  return (
    <div
      className={`relative border-l border-gray-100 ${className}`}
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, ${rowHeightPx}px)`,
        ...style,
      }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`border-b ${i % 2 === 0 ? 'border-gray-100' : 'border-gray-50'}`}
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
        />
      ))}
    </div>
  )
}
