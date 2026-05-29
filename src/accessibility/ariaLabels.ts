import type { CalendarBlock, DayKey } from '../types'
import { formatTime12 } from '../utils/time'

const DAY_NAMES: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
}

const DAY_DATES: Record<DayKey, string> = {
  mon: 'April 28',
  tue: 'April 29',
  wed: 'April 30',
  thu: 'May 1',
  fri: 'May 2',
}

function formatTimeRange(block: CalendarBlock): string {
  const start = formatTime12(block.startHour, block.startMinute)
  const end = formatTime12(block.endHour, block.endMinute)
  if (start === end) return start
  return `${start} to ${end}`
}

function dayPhrase(block: CalendarBlock): string {
  const day = block.days[0]
  if (!day) return ''
  return `${DAY_NAMES[day]} ${formatTimeRange(block)}`
}

export function getBlockAriaLabel(block: CalendarBlock): string {
  const member = block.memberCount
  const slots = member
    ? `, ${member.filled} of ${member.max} slots ${block.clickable ? 'available, click to book' : 'filled'}`
    : ''

  if (block.color === 'assignment') {
    if (block.id === 'hw4-due') {
      return 'HW4 Binary Trees assignment due Friday May 2nd'
    }
    if (block.id === 'ps3-due') {
      return 'PS3 assignment due Thursday May 1st'
    }
    return `${block.label} assignment due ${block.days.map((d) => DAY_DATES[d]).join(', ')}`
  }

  if (block.id === 'oh-smith' || block.label.includes('Prof. Smith')) {
    return `Office hours with Professor Smith for ECS 36C Data Structures, Wednesday 3 to 5pm, 3 of 5 slots available, click to book`
  }

  if (block.id === 'oh-smith-reminder') {
    return 'Reminder: Office hours with Professor Smith, Wednesday 3 to 5pm'
  }

  if (block.id === 'study-bis') {
    return 'Study group for BIS 101 Lab report session, Tuesday 7pm at Shields Library Room 182, 7 of 10 spots filled, click to join'
  }

  if (block.color === 'aatc') {
    return `AATC tutoring for ${block.course ?? 'course'}, ${dayPhrase(block)}${slots}`
  }

  if (block.color === 'oh' || block.color === 'oh-reminder') {
    return `Office hours ${block.instructor ?? ''} for ${block.course ?? block.label}, ${dayPhrase(block)}${slots}`
  }

  if (block.color === 'ta') {
    return `TA office hours for ${block.course ?? 'course'}, ${dayPhrase(block)}${slots}`
  }

  if (block.color === 'study') {
    return `Study group for ${block.course ?? block.label}, ${dayPhrase(block)} at ${block.location ?? 'campus'}${slots.replace('book', 'join')}`
  }

  if (block.color === 'ecs') {
    return `ECS 36C class, ${dayPhrase(block)}`
  }

  if (block.color === 'bis') {
    return `BIS 101 class, ${dayPhrase(block)}`
  }

  if (block.color === 'psc') {
    return `PSC 120 class, ${dayPhrase(block)}`
  }

  return `${block.label}${block.sublabel ? `, ${block.sublabel}` : ''}`
}
