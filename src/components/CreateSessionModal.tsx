import { X } from 'lucide-react'
import { useState } from 'react'
import { useAccessibility } from '../accessibility/AccessibilityContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { DayKey } from '../types'
import { KeyboardHint } from './accessibility/KeyboardHint'

const COURSES = ['ECS 36C', 'BIS 101', 'PSC 120'] as const

const DAY_OPTIONS: { value: DayKey; label: string }[] = [
  { value: 'mon', label: 'Mon Apr 28' },
  { value: 'tue', label: 'Tue Apr 29' },
  { value: 'wed', label: 'Wed Apr 30' },
  { value: 'thu', label: 'Thu May 1' },
  { value: 'fri', label: 'Fri May 2' },
]

export interface CreateSessionForm {
  course: string
  title: string
  day: DayKey
  startTime: string
  endTime: string
  location: string
  isZoom: boolean
  maxParticipants: number
  description: string
}

interface CreateSessionModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (form: CreateSessionForm) => void
}

export function CreateSessionModal({
  open,
  onClose,
  onSubmit,
}: CreateSessionModalProps) {
  const { reducedMotion } = useAccessibility()
  const trapRef = useFocusTrap(open, onClose)
  const [course, setCourse] = useState<string>(COURSES[0])
  const [title, setTitle] = useState('')
  const [day, setDay] = useState<DayKey>('tue')
  const [startTime, setStartTime] = useState('15:00')
  const [endTime, setEndTime] = useState('16:00')
  const [location, setLocation] = useState('')
  const [isZoom, setIsZoom] = useState(false)
  const [maxParticipants, setMaxParticipants] = useState(8)
  const [description, setDescription] = useState('')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      course,
      title,
      day,
      startTime,
      endTime,
      location: isZoom ? 'Zoom' : location,
      isZoom,
      maxParticipants,
      description,
    })
    setTitle('')
    setDescription('')
    setLocation('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={trapRef}
        className={`${reducedMotion ? '' : 'animate-modal-in'} max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-session-title"
      >
        <div className="flex items-center justify-between bg-navy px-5 py-4">
          <h2 id="create-session-title" className="text-lg font-semibold text-gold">
            Create Study Session
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 transition-colors duration-200 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <Field label="Course">
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="input-field"
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Session title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm review"
              className="input-field"
              required
            />
          </Field>

          <Field label="Date">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as DayKey)}
              className="input-field"
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="End time">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field"
              />
            </Field>
          </div>

          <Field label="Location">
            <div className="mb-2 flex gap-2">
              <ToggleBtn active={!isZoom} onClick={() => setIsZoom(false)}>
                In Person
              </ToggleBtn>
              <ToggleBtn active={isZoom} onClick={() => setIsZoom(true)}>
                Zoom
              </ToggleBtn>
            </div>
            {!isZoom && (
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Building and room"
                className="input-field"
              />
            )}
          </Field>

          <Field label={`Max participants: ${maxParticipants}`}>
            <input
              type="range"
              min={2}
              max={20}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full accent-gold"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>2</span>
              <span>20</span>
            </div>
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="What will you cover?"
            />
          </Field>

          <KeyboardHint>Escape to close</KeyboardHint>
          <button
            type="submit"
            className="a11y-focusable mt-2 w-full rounded bg-gold py-2.5 font-semibold text-navy transition-all duration-200 hover:brightness-95"
          >
            Post Session
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-3 py-1.5 text-sm transition-all duration-200 ${
        active
          ? 'bg-navy text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )
}
