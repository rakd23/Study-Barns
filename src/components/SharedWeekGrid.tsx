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
// Full mode: symmetric — gutter | 5 left | 2px divider spacer | 5 right
// We render the header as two separate halves via flex instead of one grid
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
  isDark?: boolean
}

function DayHeader({
  label,
  date,
  className = '',
  isDark,
}: {
  label: string
  date: string
  className?: string
  isDark?: boolean
}) {
  return (
    <div
      className={`border-l py-2 text-center text-xs font-semibold transition-colors duration-300 ${
        isDark
          ? 'border-white/10 text-gray-300'
          : 'border-gray-200 text-gray-700'
      } ${className}`}
    >
      <div>{label}</div>
      <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>{date}</div>
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
  isDark = false,
}: SharedWeekGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rightScrollRef = useRef<HTMLDivElement>(null)
  const timeRailRef = useRef<HTMLDivElement>(null)
  const isSyncing = useRef(false)

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
    isDark,
  }

  const handleScroll = () => {
    if (isSyncing.current) return
    const top = scrollRef.current?.scrollTop ?? 0
    if (timeRailRef.current) {
      timeRailRef.current.style.transform = `translateY(-${top}px)`
    }
    if (rightScrollRef.current && rightScrollRef.current.scrollTop !== top) {
      isSyncing.current = true
      rightScrollRef.current.scrollTop = top
      isSyncing.current = false
    }
  }

  const handleRightScroll = () => {
    if (isSyncing.current) return
    const top = rightScrollRef.current?.scrollTop ?? 0
    if (scrollRef.current && scrollRef.current.scrollTop !== top) {
      isSyncing.current = true
      scrollRef.current.scrollTop = top
      if (timeRailRef.current) {
        timeRailRef.current.style.transform = `translateY(-${top}px)`
      }
      isSyncing.current = false
    }
  }

  const bgClass = isDark ? 'bg-[#1a1a2e]' : 'bg-white'
  const headerBgClass = isDark ? 'bg-[#12122a]' : 'bg-gray-50'
  const borderClass = isDark ? 'border-white/10' : 'border-gray-200'
  const timeTextClass = isDark ? 'text-gray-500' : 'text-gray-400'
  const gutterBgClass = isDark ? 'bg-[#1a1a2e]' : 'bg-white'

  return (
    <div className={`flex min-h-0 flex-1 flex-col overflow-hidden transition-colors duration-300 ${bgClass}`}>
      {/* Day headers — in full mode render two symmetric halves */}
      {viewMode === 'full' ? (
        <div className={`flex shrink-0 border-b transition-colors duration-300 ${headerBgClass} ${borderClass}`}>
          {/* Left half header */}
          <div className="flex min-w-0 flex-1" style={{ paddingLeft: TIME_GUTTER_WIDTH }}>
            {DAYS.map((d) => (
              <DayHeader key={`l-h-${d.key}`} label={d.label} date={d.date} isDark={isDark} className="flex-1" />
            ))}
          </div>
          {/* Center divider */}
          <div className={`w-0.5 shrink-0 ${isDark ? 'bg-white/20' : 'bg-gray-300'}`} />
          {/* Right half header */}
          <div className="flex min-w-0 flex-1" style={{ paddingLeft: TIME_GUTTER_WIDTH }}>
            {DAYS.map((d) => (
              <DayHeader key={`r-h-${d.key}`} label={d.label} date={d.date} isDark={isDark} className="flex-1" />
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`grid shrink-0 border-b transition-colors duration-300 ${headerBgClass} ${borderClass}`}
          style={{ gridTemplateColumns: headerColumns }}
        >
          <div />
          {showLeft &&
            DAYS.map((d) => (
              <DayHeader key={`l-h-${d.key}`} label={d.label} date={d.date} isDark={isDark} />
            ))}
          {showRight &&
            DAYS.map((d) => (
              <DayHeader key={`r-h-${d.key}`} label={d.label} date={d.date} isDark={isDark} />
            ))}
        </div>
      )}

      {viewMode === 'full' ? (
        /* Full mode: two symmetric panels sharing scroll, each with its own time gutter */
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left panel: time gutter + 5 day columns */}
          <div className="flex min-w-0 flex-1 overflow-hidden">
            <div
              className={`relative shrink-0 overflow-hidden border-r transition-colors duration-300 ${borderClass} ${gutterBgClass}`}
              style={{ width: TIME_GUTTER_WIDTH }}
              aria-hidden
            >
              <div ref={timeRailRef} className="relative will-change-transform" style={{ height: gridHeight }}>
                {hours.map((hour, i) => (
                  <div
                    key={hour}
                    className={`absolute right-2 text-right text-[10px] leading-none transition-colors duration-300 ${timeTextClass}`}
                    style={{ top: i * rowHeight * 2 + 2, height: rowHeight * 2 }}
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
                  gridTemplateColumns: CONTENT_HALF,
                  gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
                  height: gridHeight,
                  minHeight: gridHeight,
                }}
              >
                {DAYS.map((day, i) => (
                  <CalendarDayColumn
                    key={`l-${day.key}`}
                    day={day.key}
                    blocks={leftBlocks}
                    style={{ gridColumn: i + 1, gridRow: `1 / span ${rows}` }}
                    {...columnProps}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Center divider */}
          <div className={`w-0.5 shrink-0 ${isDark ? 'bg-white/20' : 'bg-gray-300'}`} />

          {/* Right panel: time gutter + 5 day columns */}
          <div className="flex min-w-0 flex-1 overflow-hidden">
            <div
              className={`relative shrink-0 overflow-hidden border-r transition-colors duration-300 ${borderClass} ${gutterBgClass}`}
              style={{ width: TIME_GUTTER_WIDTH }}
              aria-hidden
            >
              <div className="relative" style={{ height: gridHeight }}>
                {hours.map((hour, i) => (
                  <div
                    key={hour}
                    className={`absolute right-2 text-right text-[10px] leading-none transition-colors duration-300 ${timeTextClass}`}
                    style={{ top: i * rowHeight * 2 + 2, height: rowHeight * 2 }}
                  >
                    {formatHour(hour)}
                  </div>
                ))}
              </div>
            </div>
            <div
              ref={rightScrollRef}
              onScroll={handleRightScroll}
              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
            >
              <div
                className="grid w-full"
                style={{
                  gridTemplateColumns: CONTENT_HALF,
                  gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
                  height: gridHeight,
                  minHeight: gridHeight,
                }}
              >
                {DAYS.map((day, i) => (
                  <CalendarDayColumn
                    key={`r-${day.key}`}
                    day={day.key}
                    blocks={rightBlocks}
                    style={{ gridColumn: i + 1, gridRow: `1 / span ${rows}` }}
                    {...columnProps}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Half mode (left or right only) */
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div
            className={`relative shrink-0 overflow-hidden border-r transition-colors duration-300 ${borderClass} ${gutterBgClass}`}
            style={{ width: TIME_GUTTER_WIDTH }}
            aria-hidden
          >
            <div ref={timeRailRef} className="relative will-change-transform" style={{ height: gridHeight }}>
              {hours.map((hour, i) => (
                <div
                  key={hour}
                  className={`absolute right-2 text-right text-[10px] leading-none transition-colors duration-300 ${timeTextClass}`}
                  style={{ top: i * rowHeight * 2 + 2, height: rowHeight * 2 }}
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
                gridTemplateColumns: CONTENT_HALF,
                gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
                height: gridHeight,
                minHeight: gridHeight,
              }}
            >
              {showLeft && DAYS.map((day, i) => (
                <CalendarDayColumn
                  key={`l-${day.key}`}
                  day={day.key}
                  blocks={leftBlocks}
                  style={{ gridColumn: i + 1, gridRow: `1 / span ${rows}` }}
                  {...columnProps}
                />
              ))}
              {showRight && DAYS.map((day, i) => (
                <CalendarDayColumn
                  key={`r-${day.key}`}
                  day={day.key}
                  blocks={rightBlocks}
                  style={{ gridColumn: i + 1, gridRow: `1 / span ${rows}` }}
                  {...columnProps}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
