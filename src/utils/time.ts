import { HOUR_END, HOUR_START, SLOTS_PER_HOUR } from '../data/initialBlocks'

/** Fixed row height so left/right calendars stay aligned in the shared grid. */
export const GRID_ROW_HEIGHT_PX = 32

/** Uniform corner radius for all calendar event blocks. */
export const BLOCK_BORDER_RADIUS_PX = 6

export const TIME_GUTTER_WIDTH = '48px'

export const WEEK_GRID_COLUMNS = `${TIME_GUTTER_WIDTH} repeat(5, minmax(0, 1fr)) repeat(5, minmax(0, 1fr))`

export function timeToRow(hour: number, minute: number): number {
  const totalMinutes = (hour - HOUR_START) * 60 + minute
  return Math.round(totalMinutes / 30)
}

export function durationRows(
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
): number {
  const start = startHour * 60 + startMinute
  const end = endHour * 60 + endMinute
  return Math.max(1, Math.round((end - start) / 30))
}

export function formatHour(hour: number): string {
  if (hour === 12) return '12pm'
  if (hour > 12) return `${hour - 12}pm`
  if (hour === 0) return '12am'
  return `${hour}am`
}

export function formatTime12(hour: number, minute: number): string {
  const h = hour % 12 || 12
  const m = minute === 0 ? '' : `:${minute.toString().padStart(2, '0')}`
  const ampm = hour >= 12 ? 'pm' : 'am'
  return `${h}${m}${ampm}`
}

export function totalGridRows(): number {
  return (HOUR_END - HOUR_START + 1) * SLOTS_PER_HOUR
}

export function calendarGridHeightPx(): number {
  return totalGridRows() * GRID_ROW_HEIGHT_PX
}

export function buildGoogleCalendarUrl(params: {
  title: string
  start: Date
  end: Date
  location: string
  details: string
}): string {
  const fmt = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  }
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates: `${fmt(params.start)}/${fmt(params.end)}`,
    location: params.location,
    details: params.details,
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}
