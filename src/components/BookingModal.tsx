import {
  BookOpen,
  Check,
  Copy,
  User,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAccessibility } from '../accessibility/AccessibilityContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { BookingState, CalendarBlock, SessionType } from '../types'
import { buildGoogleCalendarUrl } from '../utils/time'
import { KeyboardHint } from './accessibility/KeyboardHint'

const APRIL_2025 = { year: 2025, month: 3 }

const AVAILABLE_DATES = new Set([
  28, 29, 30,
])

interface Slot {
  time: string
  label: string
  full: boolean
  open: number
}

const APR_29_SLOTS: Slot[] = [
  { time: '15:00', label: '3:00pm', full: true, open: 0 },
  { time: '15:20', label: '3:20pm', full: true, open: 0 },
  { time: '15:40', label: '3:40pm', full: false, open: 1 },
  { time: '16:00', label: '4:00pm', full: false, open: 2 },
  { time: '16:20', label: '4:20pm', full: false, open: 2 },
  { time: '16:40', label: '4:40pm', full: false, open: 3 },
]

interface BookingModalProps {
  booking: BookingState | null
  onClose: () => void
  onUpdate: (patch: Partial<BookingState>) => void
  onConfirm: (booking: BookingState) => void
}

export function BookingModal({
  booking,
  onClose,
  onUpdate,
  onConfirm,
}: BookingModalProps) {
  const { reducedMotion } = useAccessibility()
  const trapRef = useFocusTrap(!!booking, onClose)
  const [copied, setCopied] = useState(false)
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    if (booking?.step === 4) {
      if (reducedMotion) {
        setShowCheck(true)
        return
      }
      const t = setTimeout(() => setShowCheck(true), 50)
      return () => clearTimeout(t)
    }
    setShowCheck(false)
  }, [booking?.step, reducedMotion])

  if (!booking) return null

  const modalAnim = reducedMotion ? '' : 'animate-modal-in'

  const { block, step, sessionType, selectedDate, selectedSlot, description, notes } =
    booking

  const shareLink = `studybarns.app/session/ecs36c-apr29`

  const canNextStep1 = sessionType !== null
  const canNextStep2 = selectedSlot !== null
  const canNextStep3 = description.trim().length >= 10

  const headerTitle =
    block.instructor || block.label.split('·').pop()?.trim() || block.label

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const parseSlotDate = (): Date => {
    const d = selectedDate ?? new Date(2025, 3, 29)
    const slot = APR_29_SLOTS.find((s) => s.time === selectedSlot)
    const [h, m] = (slot?.time ?? '15:40').split(':').map(Number)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m)
  }

  const googleUrl = buildGoogleCalendarUrl({
    title: `${sessionType === 'study-session' ? 'Study Session' : 'Office Hours'} — ${block.course ?? block.label}`,
    start: parseSlotDate(),
    end: new Date(parseSlotDate().getTime() + 20 * 60 * 1000),
    location: block.location ?? 'UC Davis',
    details: description,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={trapRef}
        className={`${modalAnim} flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-xl`}
        role="dialog"
        aria-modal="true"
        aria-label="Book a session"
      >
        <div className="bg-navy px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{headerTitle}</h2>
              <p className="text-sm text-gold">{block.course ?? 'UC Davis'}</p>
              <p className="text-xs text-white/70">
                {block.location ?? 'Campus'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="a11y-focusable text-white/70 transition-colors duration-200 hover:text-white"
              aria-label="Close booking dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <ProgressBar step={step} />
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === 1 && (
            <StepSelectType
              sessionType={sessionType}
              defaultType={block.bookingType ?? 'office-hours'}
              onSelect={(t) => onUpdate({ sessionType: t })}
            />
          )}
          {step === 2 && (
            <StepPickTime
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSelectDate={(d) =>
                onUpdate({ selectedDate: d, selectedSlot: null })
              }
              onSelectSlot={(s) => onUpdate({ selectedSlot: s })}
            />
          )}
          {step === 3 && (
            <StepDetails
              sessionType={sessionType}
              description={description}
              notes={notes}
              shareLink={shareLink}
              copied={copied}
              onDescriptionChange={(v) => onUpdate({ description: v })}
              onNotesChange={(v) => onUpdate({ notes: v })}
              onCopy={handleCopy}
            />
          )}
          {step === 4 && (
            <StepConfirm
              block={block}
              sessionType={sessionType}
              description={description}
              selectedSlot={selectedSlot}
              showCheck={showCheck}
              reducedMotion={reducedMotion}
              googleUrl={googleUrl}
              onDone={() => onConfirm(booking)}
            />
          )}
        </div>

        {step < 4 && (
          <div className="border-t border-gray-100 px-5 py-4">
            <KeyboardHint>Escape to close · Enter to continue · Space to select</KeyboardHint>
            <div className="mt-2 flex justify-end gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() =>
                  onUpdate({ step: (step - 1) as BookingState['step'] })
                }
                className="rounded px-4 py-2 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-100"
              >
                Back
              </button>
            )}
            <button
              type="button"
              disabled={
                (step === 1 && !canNextStep1) ||
                (step === 2 && !canNextStep2) ||
                (step === 3 && !canNextStep3)
              }
              onClick={() =>
                onUpdate({ step: (step + 1) as BookingState['step'] })
              }
              className="rounded bg-navy px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProgressBar({ step }: { step: number }) {
  const labels = ['Select type', 'Pick a time', 'Details', 'Confirm']
  return (
    <div className="mt-4 flex items-center justify-between gap-1">
      {labels.map((label, i) => {
        const n = i + 1
        const done = n < step
        const active = n === step
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className={`h-0.5 flex-1 ${done || active ? 'bg-gold' : 'bg-white/20'}`}
                />
              )}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                  done
                    ? 'bg-green-500 text-white'
                    : active
                      ? 'bg-gold text-navy'
                      : 'bg-white/20 text-white/60'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </div>
              {i < labels.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${done ? 'bg-gold' : 'bg-white/20'}`}
                />
              )}
            </div>
            <span className="hidden text-[9px] text-white/70 sm:block">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

function StepSelectType({
  sessionType,
  defaultType,
  onSelect,
}: {
  sessionType: SessionType | null
  defaultType: SessionType
  onSelect: (t: SessionType) => void
}) {
  const selected = sessionType ?? defaultType

  const cards: {
    type: SessionType
    title: string
    desc: string
    icon: typeof User
  }[] = [
    {
      type: 'office-hours',
      title: 'Office Hours',
      desc: 'One-on-one help with your professor or TA.',
      icon: User,
    },
    {
      type: 'study-session',
      title: 'Study Session',
      desc: 'Collaborate with classmates on course material.',
      icon: Users,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ type, title, desc, icon: Icon }) => {
        const isSelected = selected === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`relative rounded-lg border-2 p-4 text-left shadow-sm transition-all duration-200 ${
              isSelected
                ? 'border-navy bg-white'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {isSelected && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold">
                <Check className="h-3 w-3 text-navy" strokeWidth={3} />
              </span>
            )}
            <Icon className="mb-2 h-6 w-6 text-navy" />
            <div className="font-semibold text-navy">{title}</div>
            <p className="mt-1 text-xs text-gray-500">{desc}</p>
          </button>
        )
      })}
    </div>
  )
}

function StepPickTime({
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
}: {
  selectedDate: Date | null
  selectedSlot: string | null
  onSelectDate: (d: Date) => void
  onSelectSlot: (s: string) => void
}) {
  const year = APRIL_2025.year
  const month = APRIL_2025.month
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const showSlots =
    selectedDate?.getDate() === 29 && selectedDate.getMonth() === 3

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm text-blue-900">
        <BookOpen className="h-4 w-4 shrink-0" />
        <span>HW4: Binary Trees — due Fri May 2</span>
      </div>

      <p className="mb-2 text-sm font-medium text-gray-700">April 2025</p>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-gray-400">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />
          const available = AVAILABLE_DATES.has(day)
          const isWed = new Date(year, month, day).getDay() === 3
          const isSelected = selectedDate?.getDate() === day
          return (
            <button
              key={day}
              type="button"
              disabled={!available}
              onClick={() => onSelectDate(new Date(year, month, day))}
              className={`rounded py-1.5 text-xs transition-all duration-200 ${
                !available
                  ? 'cursor-not-allowed text-gray-300'
                  : isSelected
                    ? 'bg-navy font-bold text-white'
                    : isWed
                      ? 'bg-navy/15 font-semibold text-navy hover:bg-navy/25'
                      : 'bg-navy text-white hover:bg-navy/90'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-[10px] text-gray-400">
        Navy days are available · Wednesdays are office hours days
      </p>

      {showSlots && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Available slots — Apr 29
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {APR_29_SLOTS.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={slot.full}
                onClick={() => onSelectSlot(slot.time)}
                className={`rounded border px-2 py-2 text-xs transition-all duration-200 ${
                  slot.full
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                    : selectedSlot === slot.time
                      ? 'border-gold bg-navy text-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-navy'
                }`}
              >
                <div className="font-medium">{slot.label}</div>
                {slot.full ? (
                  <span className="text-red-500">Full</span>
                ) : (
                  <span className="text-green-600">
                    {slot.open} slot{slot.open > 1 ? 's' : ''} open
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StepDetails({
  sessionType,
  description,
  notes,
  shareLink,
  copied,
  onDescriptionChange,
  onNotesChange,
  onCopy,
}: {
  sessionType: SessionType | null
  description: string
  notes: string
  shareLink: string
  copied: boolean
  onDescriptionChange: (v: string) => void
  onNotesChange: (v: string) => void
  onCopy: () => void
}) {
  const max = 300
  const placeholder =
    sessionType === 'study-session'
      ? 'What should the group focus on?'
      : 'Describe your question or topic.'

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          What do you need help with?
        </label>
        <textarea
          value={description}
          onChange={(e) =>
            onDescriptionChange(e.target.value.slice(0, max))
          }
          rows={4}
          placeholder={placeholder}
          className="input-field resize-none"
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {description.length}/{max}
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Notes (optional)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="input-field"
          placeholder="Any extra context"
        />
      </div>
      {sessionType === 'study-session' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Shareable link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="input-field flex-1 text-gray-600"
            />
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center gap-1 rounded bg-navy px-3 py-2 text-sm text-white transition-all duration-200 hover:bg-navy/90"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StepConfirm({
  block,
  sessionType,
  description,
  selectedSlot,
  showCheck,
  reducedMotion,
  googleUrl,
  onDone,
}: {
  block: CalendarBlock
  sessionType: SessionType | null
  description: string
  selectedSlot: string | null
  showCheck: boolean
  reducedMotion: boolean
  googleUrl: string
  onDone: () => void
}) {
  const slot = APR_29_SLOTS.find((s) => s.time === selectedSlot)

  return (
    <div className="text-center">
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ${
          showCheck
            ? reducedMotion
              ? ''
              : 'animate-check-in'
            : 'opacity-0'
        }`}
      >
        <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left text-sm shadow-sm">
        <Row label="Who" value={block.instructor ?? block.label} />
        <Row
          label="When"
          value={`Apr 29, 2025 · ${slot?.label ?? '3:40pm'}`}
        />
        <Row label="Where" value={block.location ?? 'UC Davis'} />
        <Row label="What" value={description} />
        <Row
          label="Type"
          value={
            sessionType === 'study-session' ? 'Study Session' : 'Office Hours'
          }
        />
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <a
          href={googleUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-navy px-4 py-2 text-sm font-medium text-navy transition-all duration-200 hover:bg-navy hover:text-white"
        >
          Add to Google Calendar
        </a>
        <button
          type="button"
          onClick={onDone}
          className="rounded bg-gold px-4 py-2 text-sm font-semibold text-navy transition-all duration-200 hover:brightness-95"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gray-200 py-2 last:border-0">
      <span className="text-xs font-medium uppercase text-gray-400">{label}</span>
      <p className="mt-0.5 text-navy">{value}</p>
    </div>
  )
}
