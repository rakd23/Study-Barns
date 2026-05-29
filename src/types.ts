export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

export type SessionType = 'office-hours' | 'study-session'

export type BlockColor =
  | 'ecs'
  | 'bis'
  | 'psc'
  | 'assignment'
  | 'aatc'
  | 'oh'
  | 'oh-reminder'
  | 'ta'
  | 'study'

export interface CalendarBlock {
  id: string
  label: string
  sublabel?: string
  course?: string
  days: DayKey[]
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
  color: BlockColor
  side: 'left' | 'right'
  clickable?: boolean
  walkIn?: boolean
  memberCount?: { filled: number; max: number }
  organizer?: string
  bookingType?: SessionType
  location?: string
  instructor?: string
}

export interface BookingState {
  block: CalendarBlock
  step: 1 | 2 | 3 | 4
  sessionType: SessionType | null
  selectedDate: Date | null
  selectedSlot: string | null
  description: string
  notes: string
}

export interface CreatedSession {
  id: string
  course: string
  title: string
  day: DayKey
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
  maxParticipants: number
  shareLink: string
}

export interface ReviewState {
  rating: number
  comment: string
  submitted: boolean
  dismissing: boolean
}
