import {
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

interface Slot {
  time: string
  label: string
  full: boolean
  open: number
}

function generateSlots(startHour: number, endHour: number): Slot[] {
  const slots: Slot[] = []
  for (let h = startHour; h < endHour; h++) {
    for (const m of [0, 20, 40]) {
      if (h * 60 + m >= endHour * 60) break
      const ampm = h >= 12 ? 'pm' : 'am'
      const h12 = h % 12 || 12
      const label = m === 0 ? `${h12}:00${ampm}` : `${h12}:${m}${ampm}`
      const full = Math.random() < 0.25
      const open = full ? 0 : Math.floor(Math.random() * 3) + 1
      slots.push({ time: `${h}:${m === 0 ? '00' : m}`, label, full, open })
    }
  }
  // ensure at least 2 open slots for demo
  let openCount = slots.filter(s => !s.full).length
  for (const s of slots) {
    if (openCount >= 2) break
    if (s.full) { s.full = false; s.open = 1; openCount++ }
  }
  return slots
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
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (booking?.step === 3) {
      const t = setTimeout(() => setShowCheck(true), 50)
      return () => clearTimeout(t)
    }
    setShowCheck(false)
  }, [booking?.step])

  if (!booking) return null

  const { block, step, sessionType, selectedSlot, description, notes } = booking
  const slots = generateSlots(block.startHour, block.endHour)
  const shareLink = `studybarns.app/session/${(block.course ?? 'session').toLowerCase().replace(/\s/g, '')}-apr29`

  const canNext1 = selectedSlot !== null
  const canNext2 = description.trim().length >= 3

  const headerTitle = block.instructor ?? block.label.split('·').pop()?.trim() ?? block.label

  const parseSlotDate = () => {
    const [h, m] = (selectedSlot ?? `${block.startHour}:00`).split(':').map(Number)
    return new Date(2025, 3, 29, h, m)
  }

  const googleUrl = buildGoogleCalendarUrl({
    title: `${sessionType === 'study-session' ? 'Study Session' : 'Office Hours'} — ${block.course ?? block.label}`,
    start: parseSlotDate(),
    end: new Date(parseSlotDate().getTime() + 20 * 60 * 1000),
    location: block.location ?? 'UC Davis',
    details: description,
  })

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stepLabels = ['Pick a time', 'Details', 'Confirm']

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
            <button type="button" onClick={onClose} className="text-white/70 hover:text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Progress */}
          <div className="mt-4 flex items-center gap-1">
            {stepLabels.map((label, i) => {
              const n = i + 1
              const done = n < step
              const active = n === step
              return (
                <div key={label} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-center">
                    {i > 0 && <div className={`h-0.5 flex-1 ${done || active ? 'bg-gold' : 'bg-white/20'}`} />}
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-green-500 text-white' : active ? 'bg-gold text-navy' : 'bg-white/20 text-white/60'}`}>
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
          {/* Step 1: Pick a time */}
          {step === 1 && (
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">
                {block.sublabel ?? `${block.startHour % 12 || 12}am–${block.endHour % 12 || 12}${block.endHour >= 12 ? 'pm' : 'am'}`} · {block.location ?? 'Campus'}
              </p>
              <p className="mb-4 text-xs text-gray-400">Select a 20-minute slot within the office hours window</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={slot.full}
                    onClick={() => onUpdate({ selectedSlot: slot.time, sessionType: block.bookingType ?? 'office-hours' })}
                    className={`rounded border px-2 py-3 text-xs transition-all duration-200 ${
                      slot.full
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        : selectedSlot === slot.time
                          ? 'border-gold bg-navy text-white shadow-md'
                          : 'border-gray-200 bg-white hover:border-navy'
                    }`}
                  >
                    <div className="font-semibold">{slot.label}</div>
                    {slot.full
                      ? <span className="text-red-400">Full</span>
                      : <span className="text-green-600">{slot.open} slot{slot.open > 1 ? 's' : ''} open</span>
                    }
                  </button>
                ))}
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

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="text-center">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ${showCheck ? 'animate-check-in' : 'opacity-0'}`}>
                <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left text-sm shadow-sm">
                {[
                  ['Who', block.instructor ?? headerTitle],
                  ['When', `${block.days[0] === 'wed' ? 'Wed Apr 30' : 'Tue Apr 29'} · ${slots.find(s => s.time === selectedSlot)?.label ?? ''}`],
                  ['Where', block.location ?? 'UC Davis'],
                  ['What', description || '—'],
                  ['Type', sessionType === 'study-session' ? 'Study Session' : 'Office Hours'],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-gray-200 py-2 last:border-0">
                    <span className="text-xs font-medium uppercase text-gray-400">{label}</span>
                    <p className="mt-0.5 text-navy">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <a href={googleUrl} target="_blank" rel="noreferrer" className="rounded border border-navy px-4 py-2 text-sm font-medium text-navy hover:bg-navy hover:text-white">
                  Add to Google Calendar
                </a>
                <button type="button" onClick={() => onConfirm(booking)} className="rounded bg-gold px-4 py-2 text-sm font-semibold text-navy hover:brightness-95">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
              {step === 2 ? 'Confirm' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
