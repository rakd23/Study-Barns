import { AlertTriangle, Check, Copy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAccessibility } from '../accessibility/AccessibilityContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { BookingState, CalendarBlock, SessionType } from '../types'

interface Slot {
  time: string
  label: string
  full: boolean
  open: number
}

function generateSlots(block: CalendarBlock): Slot[] {
  const { startHour, startMinute, endHour, endMinute, id } = block
  const totalMins = (endHour * 60 + endMinute) - (startHour * 60 + startMinute)
  const count = Math.max(3, Math.floor(totalMins / 20))
  const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const pseudo = (i: number) => ((seed * 31 + i * 17) % 100) / 100

  return Array.from({ length: count }, (_, i) => {
    const totalStartMins = startHour * 60 + startMinute + i * 20
    const h = Math.floor(totalStartMins / 60)
    const m = totalStartMins % 60
    const ampm = h >= 12 ? 'pm' : 'am'
    const h12 = h % 12 || 12
    const label = `${h12}:${m === 0 ? '00' : String(m).padStart(2, '0')}${ampm}`
    // First 2 slots have a chance of being full, rest always open
    const full = i < 2 && pseudo(i) > 0.6
    return { time: `${h}:${String(m).padStart(2, '0')}`, label, full, open: full ? 0 : 1 }
  })
}

function buildGCalUrl(params: {
  title: string
  start: Date
  end: Date
  location: string
  details: string
}): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates: `${fmt(params.start)}/${fmt(params.end)}`,
    location: params.location,
    details: params.details,
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}

interface BookingModalProps {
  booking: BookingState | null
  onClose: () => void
  onUpdate: (patch: Partial<BookingState>) => void
  onConfirm: (booking: BookingState) => void
}

export function BookingModal({ booking, onClose, onUpdate, onConfirm }: BookingModalProps) {
  const { reducedMotion } = useAccessibility()
  const trapRef = useFocusTrap(!!booking, onClose)
  const [showCheck, setShowCheck] = useState(false)
  const [checkRing, setCheckRing] = useState(false)
  const [copied, setCopied] = useState(false)
  // Track slots that got taken while user was browsing (double-booking warning)
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (booking?.step === 3) {
      setShowCheck(false)
      setCheckRing(false)
      const t1 = setTimeout(() => setShowCheck(true), 150)
      const t2 = setTimeout(() => setCheckRing(true), 500)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    } else {
      setShowCheck(false)
      setCheckRing(false)
    }
  }, [booking?.step])

  // Reset taken slots when modal opens fresh
  useEffect(() => {
    if (booking?.step === 1) setTakenSlots(new Set())
  }, [booking?.block?.id])

  if (!booking) return null

  const { block, step, sessionType, selectedSlot, description, notes } = booking
  const slots = generateSlots(block)
  const shareLink = `studybarns.app/session/${(block.course ?? 'session').toLowerCase().replace(/\s/g, '')}-apr29`
  const canNext1 = selectedSlot !== null && !takenSlots.has(selectedSlot)
  const canNext2 = description.trim().length >= 3
  const headerTitle = block.instructor ?? block.course ?? block.label.split('·').pop()?.trim() ?? block.label

  const dayLabelMap: Record<string, string> = {
    mon: 'Mon Apr 28', tue: 'Tue Apr 29', wed: 'Wed Apr 30', thu: 'Thu May 1', fri: 'Fri May 2',
  }
  const dayLabel = dayLabelMap[block.days[0] ?? 'tue'] ?? 'Tue Apr 29'

  const parseSlotDate = () => {
    const slotStr = selectedSlot ?? `${block.startHour}:00`
    const [h, m] = slotStr.split(':').map(Number)
    const dateMap: Record<string, [number, number]> = {
      mon: [3, 28], tue: [3, 29], wed: [3, 30], thu: [4, 1], fri: [4, 2],
    }
    const [month, date] = dateMap[block.days[0] ?? 'tue'] ?? [3, 29]
    return new Date(2025, month, date, h, m)
  }

  const slotLabel = slots.find(s => s.time === selectedSlot)?.label ?? ''

  const googleUrl = buildGCalUrl({
    title: `${sessionType === 'study-session' ? 'Study Session' : 'Office Hours'} — ${block.course ?? block.label}`,
    start: parseSlotDate(),
    end: new Date(parseSlotDate().getTime() + 20 * 60 * 1000),
    location: block.location ?? 'UC Davis',
    details: `${description}${notes ? `\n\nNotes: ${notes}` : ''}\n\nBooked via StudyBarns\n\n⏰ Reminders set for 1 day, 1 hour, and 10 minutes before`,
  })

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSlotClick = (slot: Slot) => {
    if (slot.full || takenSlots.has(slot.time)) return
    // Deselect if clicking the already-selected slot
    if (selectedSlot === slot.time) {
      onUpdate({ selectedSlot: null })
      return
    }
    // Simulate a race condition: if another slot was selected before,
    // mark it as now taken (someone else grabbed it)
    if (selectedSlot && Math.random() < 0.15) {
      setTakenSlots(prev => new Set(prev).add(selectedSlot))
    }
    onUpdate({ selectedSlot: slot.time, sessionType: block.bookingType ?? 'office-hours' })
  }

  const isSlotTaken = (slot: Slot) => slot.full || takenSlots.has(slot.time)
  const selectedSlotJustTaken = selectedSlot !== null && takenSlots.has(selectedSlot)

  const stepLabels = ['Pick a time', 'Details', 'Confirmed!']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={trapRef}
        className={`${reducedMotion ? '' : 'animate-modal-in'} flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-xl`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-navy px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{headerTitle}</h2>
              <p className="text-sm text-gold">{block.course ?? 'UC Davis'}</p>
              <p className="text-xs text-white/70">{block.location ?? 'Campus'}</p>
            </div>
            <button type="button" onClick={onClose} className="mt-1 text-white/70 hover:text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Progress */}
          <div className="mt-4 flex items-center">
            {stepLabels.map((label, i) => {
              const n = i + 1
              const done = n < step
              const active = n === step
              return (
                <div key={label} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-center">
                    {i > 0 && <div className={`h-0.5 flex-1 ${done || active ? 'bg-gold' : 'bg-white/20'}`} />}
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${done ? 'bg-green-500 text-white' : active ? 'bg-gold text-navy' : 'bg-white/20 text-white/60'}`}>
                      {done ? <Check className="h-4 w-4" /> : n}
                    </div>
                    {i < stepLabels.length - 1 && <div className={`h-0.5 flex-1 ${done ? 'bg-gold' : 'bg-white/20'}`} />}
                  </div>
                  <span className="hidden text-[9px] text-white/70 sm:block">{label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* Step 1: Pick a slot */}
          {step === 1 && (
            <div>
              <p className="mb-1 text-sm font-semibold text-navy">{block.sublabel} · {block.location ?? 'Campus'}</p>
              <p className="mb-3 text-xs text-gray-400">Each slot is 20 minutes · One student per slot</p>

              {/* Double-booking warning */}
              {selectedSlotJustTaken && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span>That slot was just taken by another student. Please choose a different time.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((slot) => {
                  const taken = isSlotTaken(slot)
                  const isSelected = selectedSlot === slot.time
                  const isJustTaken = takenSlots.has(slot.time)
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={taken}
                      onClick={() => handleSlotClick(slot)}
                      className={`rounded border px-2 py-3 text-xs transition-all duration-200 ${
                        taken
                          ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                          : isSelected && isJustTaken
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : isSelected
                              ? 'border-gold bg-navy text-white shadow-md'
                              : 'border-gray-200 bg-white hover:border-navy'
                      }`}
                    >
                      <div className="font-semibold">{slot.label}</div>
                      {slot.full
                        ? <span className="text-red-400">Full</span>
                        : isJustTaken
                          ? <span className="text-red-400">Just taken</span>
                          : <span className="text-green-600">1 slot open</span>
                      }
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {sessionType === 'study-session' ? 'What will the group focus on?' : 'What do you need help with?'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => onUpdate({ description: e.target.value.slice(0, 300) })}
                  rows={4}
                  placeholder={sessionType === 'study-session' ? 'e.g. Practice problems for midterm' : 'e.g. Struggling with binary tree traversal'}
                  className="input-field resize-none"
                  autoFocus
                />
                <p className="mt-1 text-right text-xs text-gray-400">{description.length}/300</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => onUpdate({ notes: e.target.value })}
                  className="input-field"
                  placeholder="Any extra context"
                />
              </div>
              {sessionType === 'study-session' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Shareable link</label>
                  <div className="flex gap-2">
                    <input type="text" readOnly value={shareLink} className="input-field flex-1 text-gray-500" />
                    <button type="button" onClick={handleCopy} className="flex items-center gap-1 rounded bg-navy px-3 py-2 text-sm text-white hover:bg-navy/90">
                      <Copy className="h-4 w-4" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmed */}
          {step === 3 && (
            <div className="flex flex-col items-center py-4">
              <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
                {/* Pulse ring */}
                <div
                  className="absolute inset-0 rounded-full bg-green-100 transition-all duration-700 ease-out"
                  style={{ transform: checkRing ? 'scale(1)' : 'scale(0.4)', opacity: checkRing ? 1 : 0 }}
                />
                {/* Green circle */}
                <div
                  className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-lg transition-all duration-500 ease-out"
                  style={{ transform: showCheck ? 'scale(1)' : 'scale(0.3)', opacity: showCheck ? 1 : 0 }}
                >
                  <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none">
                    <path
                      d="M8 20 L16 28 L32 12"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 42,
                        strokeDashoffset: showCheck ? 0 : 42,
                        transition: 'stroke-dashoffset 0.5s ease 0.35s',
                      }}
                    />
                  </svg>
                </div>
              </div>

              <h3 className="mb-1 text-xl font-bold text-navy">You're booked!</h3>
              <p className="mb-5 text-sm text-gray-500">Session confirmed with {headerTitle}</p>

              <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
                {([
                  ['Who', headerTitle],
                  ['When', `${dayLabel} · ${slotLabel}`],
                  ['Where', block.location ?? 'UC Davis'],
                  ['What', description || '—'],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="border-b border-gray-100 py-2 last:border-0">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
                    <p className="mt-0.5 text-navy">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 w-full space-y-2">
                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onConfirm(booking)}
                  className="flex w-full items-center justify-center gap-2 rounded bg-[#4285F4] px-4 py-3 text-sm font-semibold text-white shadow transition-all hover:brightness-95"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                  </svg>
                  Add to Google Calendar
                  <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-normal">+ 3 reminders</span>
                </a>
                <p className="text-center text-[10px] text-gray-400">
                  Includes reminders 1 day · 1 hour · 10 min before
                </p>
                <button
                  type="button"
                  onClick={() => onConfirm(booking)}
                  className="w-full rounded border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {step < 3 && (
          <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
            {step > 1 && (
              <button type="button" onClick={() => onUpdate({ step: (step - 1) as BookingState['step'] })} className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Back
              </button>
            )}
            <button
              type="button"
              disabled={step === 1 ? !canNext1 : !canNext2}
              onClick={() => onUpdate({ step: (step + 1) as BookingState['step'] })}
              className="rounded bg-navy px-5 py-2 text-sm font-medium text-white hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === 2 ? 'Confirm booking' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
