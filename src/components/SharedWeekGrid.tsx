import { useRef } from 'react'
import type { CalendarBlock } from '../types'
import { DAYS, HOUR_END, HOUR_START } from '../data/initialBlocks'
import {
  GRID_ROW_HEIGHT_PX,
  TIME_GUTTER_WIDTH,
  WEEK_GRID_COLUMNS,
  calendarGridHeightPx,
  formatHour,
  totalGridRows,
} from '../utils/time'
import { CalendarDayColumn } from './CalendarDayColumn'

const CONTENT_FULL = 'repeat(5, minmax(0, 1fr)) repeat(5, minmax(0, 1fr))'
const CONTENT_HALF = 'repeat(5, minmax(0, 1fr))'
const HEADER_LEFT = `${TIME_GUTTER_WIDTH} ${CONTENT_HALF}`
const HEADER_RIGHT = `${TIME_GUTTER_WIDTH} ${CONTENT_HALF}`
const HEADER_FULL = WEEK_GRID_COLUMNS

export type GridViewMode = 'full' | 'left' | 'right'

interface SharedWeekGridProps {
  leftBlocks: CalendarBlock[]
  rightBlocks: CalendarBlock[]
  confirmedIds: Set<string>
  starRatings: Record<string, number>
  onBlockClick?: (block: CalendarBlock) => void
  onMemberJoin?: (blockId: string) => void
  viewMode?: GridViewMode
}

function DayHeader({
  label,
  date,
  className = '',
}: {
  label: string
  date: string
  className?: string
}) {
  return (
    <div
      className={`border-l border-gray-200 py-2 text-center text-xs font-semibold text-gray-700 ${className}`}
    >
      <div>{label}</div>
      <div className="text-gray-400">{date}</div>
    </div>
  )
}

export function SharedWeekGrid({
  leftBlocks,
  rightBlocks,
  confirmedIds,
  starRatings,
  onBlockClick,
  onMemberJoin,
  viewMode = 'full',
}: SharedWeekGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const timeRailRef = useRef<HTMLDivElement>(null)

  const showLeft = viewMode === 'full' || viewMode === 'left'
  const showRight = viewMode === 'full' || viewMode === 'right'

  const headerColumns =
    viewMode === 'left'
      ? HEADER_LEFT
      : viewMode === 'right'
        ? HEADER_RIGHT
        : HEADER_FULL

  const contentColumns =
    viewMode === 'full' ? CONTENT_FULL : CONTENT_HALF

  const hours: number[] = []
  for (let h = HOUR_START; h <= HOUR_END; h++) hours.push(h)
  const rows = totalGridRows()
  const rowHeight = GRID_ROW_HEIGHT_PX
  const gridHeight = calendarGridHeightPx()

  const columnProps = {
    rows,
    rowHeightPx: rowHeight,
    confirmedIds,
    starRatings,
    onBlockClick,
    onMemberJoin,
  }

  const handleScroll = () => {
    const top = scrollRef.current?.scrollTop ?? 0
    if (timeRailRef.current) {
      timeRailRef.current.style.transform = `translateY(-${top}px)`
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div
        className="grid shrink-0 border-b border-gray-200 bg-gray-50"
        style={{ gridTemplateColumns: headerColumns }}
      >
        <div />
        {showLeft &&
          DAYS.map((d) => (
            <DayHeader key={`l-h-${d.key}`} label={d.label} date={d.date} />
          ))}
        {showRight &&
          DAYS.map((d, i) => (
            <DayHeader
              key={`r-h-${d.key}`}
              label={d.label}
              date={d.date}
              className={
                viewMode === 'full' && i === 0 ? 'border-l-2 border-gray-300' : ''
              }
            />
          ))}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className="relative shrink-0 overflow-hidden border-r border-gray-200 bg-white"
          style={{ width: TIME_GUTTER_WIDTH }}
          aria-hidden
        >
          <div
            ref={timeRailRef}
            className="relative will-change-transform"
            style={{ height: gridHeight }}
          >
            {hours.map((hour, i) => (
              <div
                key={hour}
                className="absolute right-2 text-right text-[10px] leading-none text-gray-400"
                style={{
                  top: i * rowHeight * 2 + 2,
                  height: rowHeight * 2,
                }}
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        >
          <div
            className="grid w-full"
            style={{
              gridTemplateColumns: contentColumns,
              gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
              height: gridHeight,
              minHeight: gridHeight,
            }}
          >
            {showLeft &&
              DAYS.map((day, i) => (
                <CalendarDayColumn
                  key={`l-${day.key}`}
                  day={day.key}
                  blocks={leftBlocks}
                  style={{ gridColumn: i + 1, gridRow: `1 / span ${rows}` }}
                  {...columnProps}
                />
              ))}

            {showRight &&
              DAYS.map((day, i) => (
                <CalendarDayColumn
                  key={`r-${day.key}`}
                  day={day.key}
                  blocks={rightBlocks}
                  className={
                    viewMode === 'full' && i === 0
                      ? 'border-l-2 border-gray-300'
                      : ''
                  }
                  style={{ gridColumn: i + 1, gridRow: `1 / span ${rows}` }}
                  {...columnProps}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
