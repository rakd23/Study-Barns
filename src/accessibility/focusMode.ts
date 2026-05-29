import { LEFT_BLOCKS, RIGHT_BLOCKS } from '../data/initialBlocks'
import type { CalendarBlock, DayKey } from '../types'

const DAY_ORDER: Record<DayKey, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
}

export const FOCUS_RECOMMENDATION_ID = 'oh-smith'

export function getEarliestAssignment(
  blocks: CalendarBlock[] = LEFT_BLOCKS,
): CalendarBlock | null {
  const assignments = blocks.filter((b) => b.color === 'assignment')
  if (assignments.length === 0) return null
  return [...assignments].sort((a, b) => {
    const dayA = DAY_ORDER[a.days[0] ?? 'fri']
    const dayB = DAY_ORDER[b.days[0] ?? 'fri']
    if (dayA !== dayB) return dayA - dayB
    return a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute)
  })[0]
}

export function getFocusRecommendation(
  rightBlocks: CalendarBlock[] = RIGHT_BLOCKS,
): CalendarBlock | null {
  return rightBlocks.find((b) => b.id === FOCUS_RECOMMENDATION_ID) ?? null
}

export function getFocusMessage(assignment: CalendarBlock | null): string {
  if (assignment?.id === 'hw4-due') {
    return 'Your next best option before HW4 is due.'
  }
  if (assignment) {
    return `Your next best option before ${assignment.label} is due.`
  }
  return 'Your most urgent support resource.'
}
