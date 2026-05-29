import type { CalendarBlock, DayKey } from '../../types'
import { useAccessibility } from '../../accessibility/AccessibilityContext'
import { getBlockAriaLabel } from '../../accessibility/ariaLabels'
import { DAYS } from '../../data/initialBlocks'

const DAY_ORDER: Record<DayKey, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
}

const DUE_LABELS: Record<string, { course: string; name: string; due: string }> = {
  'ps3-due': { course: 'PSC 120', name: 'PS3', due: 'Thu May 1' },
  'hw4-due': { course: 'ECS 36C', name: 'HW4: Binary Trees', due: 'Fri May 2' },
}

function sortByDay(blocks: CalendarBlock[]): CalendarBlock[] {
  return [...blocks].sort((a, b) => {
    const dayA = DAY_ORDER[a.days[0] ?? 'fri']
    const dayB = DAY_ORDER[b.days[0] ?? 'fri']
    if (dayA !== dayB) return dayA - dayB
    return a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute)
  })
}

function formatWhen(block: CalendarBlock): string {
  const day = DAYS.find((d) => d.key === block.days[0])
  const dayLabel = day ? `${day.label} ${day.date}` : ''
  if (block.sublabel) return `${dayLabel} · ${block.sublabel}`.trim()
  return dayLabel
}

interface SimplifiedViewProps {
  leftBlocks: CalendarBlock[]
  rightBlocks: CalendarBlock[]
  onBook: (block: CalendarBlock) => void
  onJoin: (blockId: string) => void
}

export function SimplifiedView({
  leftBlocks,
  rightBlocks,
  onBook,
  onJoin,
}: SimplifiedViewProps) {
  const { settings } = useAccessibility()

  const assignments = sortByDay(
    leftBlocks.filter((b) => b.color === 'assignment'),
  )

  const support = sortByDay(
    rightBlocks.filter((b) => b.side === 'right' || !b.side),
  )

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-2">
      <section className="flex min-h-0 flex-col border-b border-gray-200 lg:border-b-0 lg:border-r">
        <h2 className="shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-navy">
          Upcoming assignments
        </h2>
        <ul className="min-h-0 flex-1 overflow-y-auto p-4">
          {assignments.map((block) => {
            const meta = DUE_LABELS[block.id] ?? {
              course: block.label,
              name: block.label,
              due: formatWhen(block),
            }
            const aria =
              settings.screenReader
                ? getBlockAriaLabel(block)
                : undefined
            return (
              <li
                key={block.id}
                className="mb-3 rounded border border-pink-200 bg-pink-50 p-3 shadow-sm"
                style={{ borderRadius: 6 }}
              >
                <p className="text-xs font-medium text-pink-800">{meta.course}</p>
                <p className="font-semibold text-navy">{meta.name}</p>
                <p className="mt-1 text-xs text-gray-600">Due {meta.due}</p>
                <span className="sr-only">{aria}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="flex min-h-0 flex-col">
        <h2 className="shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-navy">
          Available support
        </h2>
        <ul className="min-h-0 flex-1 overflow-y-auto p-4">
          {support.map((block) => {
            const type =
              block.color === 'study'
                ? 'Study group'
                : block.color === 'aatc'
                  ? 'AATC'
                  : block.color === 'ta'
                    ? 'TA office hours'
                    : 'Office hours'
            const who =
              block.instructor ?? block.organizer ?? block.label
            const aria = settings.screenReader
              ? getBlockAriaLabel(block)
              : undefined
            return (
              <li
                key={block.id}
                className="mb-3 flex items-start justify-between gap-3 rounded border border-gray-200 bg-white p-3 shadow-sm"
                style={{ borderRadius: 6 }}
              >
                <div>
                  <p className="text-xs font-medium text-gray-500">{type}</p>
                  <p className="font-semibold text-navy">{who}</p>
                  <p className="text-sm text-gray-600">{formatWhen(block)}</p>
                  {block.course && (
                    <p className="text-xs text-gray-500">{block.course}</p>
                  )}
                </div>
                {block.clickable ? (
                  <button
                    type="button"
                    onClick={() => onBook(block)}
                    aria-label={aria ?? `Book ${block.label}`}
                    className="a11y-focusable shrink-0 rounded bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy/90"
                  >
                    Book
                    {settings.keyboardNav && (
                      <span className="mt-1 block text-[10px] font-normal text-gray-300">
                        Enter to book
                      </span>
                    )}
                  </button>
                ) : block.memberCount ? (
                  <button
                    type="button"
                    onClick={() => onJoin(block.id)}
                    aria-label={aria ?? `Join ${block.label}`}
                    className="a11y-focusable shrink-0 rounded bg-gold px-3 py-1.5 text-xs font-semibold text-navy hover:brightness-95"
                  >
                    Join
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
