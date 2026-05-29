import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccessibility } from './accessibility/AccessibilityContext'
import { AccessibilityPanel } from './components/accessibility/AccessibilityPanel'
import { AccessibilityStatusBar } from './components/accessibility/AccessibilityStatusBar'
import { FocusModeView } from './components/accessibility/FocusModeView'
import { SimplifiedView } from './components/accessibility/SimplifiedView'
import { BookingModal } from './components/BookingModal'
import { CreateSessionModal, type CreateSessionForm } from './components/CreateSessionModal'
import { HeaderControls } from './components/HeaderControls'
import { Legend } from './components/Legend'
import { ReviewPromptCard } from './components/ReviewPromptCard'
import { Toast } from './components/Toast'
import { SharedWeekGrid } from './components/SharedWeekGrid'
import { LEFT_BLOCKS, RIGHT_BLOCKS } from './data/initialBlocks'
import type { BookingState, CalendarBlock, DayKey } from './types'

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map(Number)
  return { hour: h, minute: m }
}

function dayToDateSlug(day: DayKey): string {
  const map: Record<DayKey, string> = {
    mon: 'apr28',
    tue: 'apr29',
    wed: 'apr30',
    thu: 'may1',
    fri: 'may2',
  }
  return map[day]
}

function dateToDay(d: Date): DayKey {
  const map: Record<number, DayKey> = {
    28: 'mon',
    29: 'tue',
    30: 'wed',
    1: 'thu',
    2: 'fri',
  }
  return map[d.getDate()] ?? 'tue'
}

const WEEK_LABEL = 'Apr 28 – May 2, 2025'

export default function App() {
  const {
    settings,
    reducedMotion,
    focusPanelExpanded,
    setFocusPanelExpanded,
    incognito,
  } = useAccessibility()

  const dismissMs = reducedMotion ? 0 : 300

  const [rightBlocks, setRightBlocks] = useState<CalendarBlock[]>(RIGHT_BLOCKS)
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(
    () => new Set(['aatc-mon', 'aatc-fri-am']),
  )
  const [memberCounts, setMemberCounts] = useState<
    Record<string, { filled: number; max: number }>
  >(() => {
    const init: Record<string, { filled: number; max: number }> = {}
    RIGHT_BLOCKS.forEach((b) => {
      if (b.memberCount) init[b.id] = { ...b.memberCount }
    })
    return init
  })
  const [starRatings, setStarRatings] = useState<Record<string, number>>({})
  const [booking, setBooking] = useState<BookingState | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [reviewVisible, setReviewVisible] = useState(true)
  const [reviewDismissing, setReviewDismissing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const weekLabel = WEEK_LABEL

  const enrichedRightBlocks = useMemo(
    () =>
      rightBlocks.map((b) => {
        const override = memberCounts[b.id]
        return override ? { ...b, memberCount: override } : b
      }),
    [rightBlocks, memberCounts],
  )

  const showToast = useCallback(
    (msg: string) => {
      setToast(msg)
      setTimeout(() => setToast(null), 3500)
    },
    [],
  )

  const openBooking = useCallback((block: CalendarBlock) => {
    setBooking({
      block,
      step: 1,
      sessionType: null,
      selectedDate: null,
      selectedSlot: null,
      description: '',
      notes: '',
    })
  }, [])

  const handleBookingConfirm = useCallback(
    (state: BookingState) => {
      const day = state.selectedDate ? dateToDay(state.selectedDate) : 'tue'
      const [h, m] = (state.selectedSlot ?? '15:40').split(':').map(Number)
      const isStudy = state.sessionType === 'study-session'
      const endHour = h + 1
      const endMinute = m
      const timeLabel = `${h % 12 || 12}:${m === 0 ? '00' : m}${h >= 12 ? 'pm' : 'am'}`
      const newId = `booked-${Date.now()}`

      const newBlock: CalendarBlock = {
        id: newId,
        label: isStudy
          ? `Study · ${state.block.course ?? 'Session'}`
          : `OH · ${state.block.instructor ?? 'Booked'}`,
        sublabel: `${timeLabel} · Booked`,
        course: state.block.course,
        instructor: state.block.instructor,
        days: [day],
        startHour: h,
        startMinute: m,
        endHour,
        endMinute,
        color: isStudy ? 'study' : 'oh',
        side: 'right',
        clickable: true,
        bookingType: state.sessionType ?? undefined,
        organizer: state.block.organizer,
        location: state.block.location,
        memberCount: { filled: 1, max: 3 },
      }

      setRightBlocks((prev) => [...prev, newBlock])
      setConfirmedIds((prev) => new Set(prev).add(newId))

      if (state.block.id) {
        setMemberCounts((prev) => {
          const cur = prev[state.block.id] ?? state.block.memberCount
          if (!cur) return prev
          return {
            ...prev,
            [state.block.id]: {
              ...cur,
              filled: Math.min(cur.filled + 1, cur.max),
            },
          }
        })
      }

      setBooking(null)
    },
    [],
  )

  const handleCreateSession = useCallback(
    (form: CreateSessionForm) => {
      const { hour: sh, minute: sm } = parseTime(form.startTime)
      const { hour: eh, minute: em } = parseTime(form.endTime)
      const slug = form.course.toLowerCase().replace(/\s+/g, '')
      const link = `studybarns.app/session/${slug}-${dayToDateSlug(form.day)}`
      const id = `created-${Date.now()}`

      const block: CalendarBlock = {
        id,
        label: form.title,
        sublabel: `${form.course}`,
        course: form.course,
        days: [form.day],
        startHour: sh,
        startMinute: sm,
        endHour: eh,
        endMinute: em,
        color: 'study',
        side: 'right',
        clickable: true,
        bookingType: 'study-session',
        location: form.location,
        organizer: form.title,
        memberCount: { filled: 1, max: form.maxParticipants },
      }

      setRightBlocks((prev) => [...prev, block])
      setMemberCounts((prev) => ({
        ...prev,
        [id]: { filled: 1, max: form.maxParticipants },
      }))
      setCreateOpen(false)
      showToast(`Session posted! Share: ${link}`)
    },
    [showToast],
  )

  const dismissReview = () => {
    setReviewDismissing(true)
    setTimeout(() => setReviewVisible(false), dismissMs)
  }

  const handleReviewSubmit = (rating: number, _comment: string) => {
    setReviewDismissing(true)
    setTimeout(() => {
      setReviewVisible(false)
      setStarRatings((prev) => ({
        ...prev,
        'BIS 101 Study Group': rating,
        'Prof. Smith': rating,
      }))
    }, dismissMs)
  }

  const handleJoinSession = (blockId: string) => {
    setMemberCounts((prev) => {
      const cur = prev[blockId]
      if (!cur || cur.filled >= cur.max) return prev
      return { ...prev, [blockId]: { ...cur, filled: cur.filled + 1 } }
    })
  }

  const isDark = incognito || settings.darkMode

  const showFocusSplit =
    settings.focusMode && !focusPanelExpanded && !settings.simplifiedView
  const showFullGrid =
    !settings.simplifiedView && (!settings.focusMode || focusPanelExpanded)

  // Incognito: mask student names in blocks passed to calendar
  const maskedRightBlocks = useMemo(() => {
    if (!incognito) return enrichedRightBlocks
    return enrichedRightBlocks.map((b) => ({
      ...b,
      organizer: b.organizer && b.organizer !== 'AATC' && !b.organizer.startsWith('Prof')
        ? 'Anonymous Student'
        : b.organizer,
    }))
  }, [enrichedRightBlocks, incognito])

  return (
    <div
      id="app-shell"
      className={`flex h-screen flex-col overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#1a1a2e]' : 'bg-white'
      }`}
    >
      {/* Header */}
      <header
        className={`flex shrink-0 items-center justify-between gap-4 px-6 py-3 shadow-md transition-colors duration-300 ${
          isDark ? 'bg-[#0a1020]' : 'bg-navy'
        }`}
      >
        <h1 className="text-xl font-bold tracking-tight text-gold">StudyBarns</h1>
        <div className="flex items-center gap-4">
          <span className={`hidden text-sm sm:inline ${isDark ? 'text-gray-300' : 'text-white'}`}>
            UC Davis · Spring 2025
          </span>
          <HeaderControls />
        </div>
      </header>

      {/* Incognito banner */}
      {incognito && (
        <div className="shrink-0 bg-[#12122a] px-4 py-2 text-center text-xs text-gray-200">
          🕵 Incognito mode on — your identity is hidden from other students
        </div>
      )}

      {/* Nav bar */}
      <nav
        className={`flex shrink-0 items-center justify-between border-b px-4 py-2.5 shadow-sm transition-colors duration-300 ${
          isDark
            ? 'border-white/10 bg-[#1a1a2e] text-gray-200'
            : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded p-1.5 transition-colors duration-200 ${
              isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
            }`}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span
            className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-navy'}`}
          >
            {weekLabel}
          </span>
          <button
            type="button"
            className={`rounded p-1.5 transition-colors duration-200 ${
              isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
            }`}
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            className={`ml-1 rounded border px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
              isDark
                ? 'border-white/20 text-gray-200 hover:bg-white/10'
                : 'border-navy text-navy hover:bg-navy hover:text-white'
            }`}
          >
            Today
          </button>
        </div>
        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${
            isDark ? 'text-green-400' : 'text-green-600'
          }`}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Synced with Canvas
        </div>
      </nav>

      <AccessibilityStatusBar />

      <main
        className={`flex min-h-0 flex-1 flex-col overflow-hidden transition-colors duration-300 ${
          isDark ? 'bg-[#1a1a2e]' : 'bg-white'
        }`}
      >
        {/* Panel headers — only shown when not in simplified view */}
        {!settings.simplifiedView && (
          <div
            className={`flex shrink-0 border-b transition-colors duration-300 ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}
          >
            {/* Left panel header */}
            <div
              className={`flex min-w-0 border-r transition-colors duration-300 ${
                isDark ? 'border-white/10' : 'border-gray-200'
              } ${showFocusSplit ? 'flex-1' : 'flex-1'}`}
            >
              <PanelHeader
                icon={<BookOpen className="h-4 w-4 text-navy" />}
                title="My classes & assignments"
                badge="Canvas"
                badgeClass="bg-navy text-white"
                isDark={isDark}
              />
            </div>

            {/* Right panel header */}
            {!showFocusSplit && (
              <div className="flex min-w-0 flex-1">
                <PanelHeader
                  icon={<GraduationCap className="h-4 w-4 text-navy" />}
                  title="Academic support"
                  badge="AATC + OH + Study"
                  badgeClass={isDark ? 'bg-white/10 text-gray-200' : 'bg-gray-100 text-navy'}
                  isDark={isDark}
                  action={
                    <button
                      type="button"
                      onClick={() => setCreateOpen(true)}
                      className="a11y-focusable flex items-center gap-1 rounded border-0 bg-[#C4A84B] px-2.5 py-1.5 text-xs font-semibold text-[#0d1b2e] shadow-sm transition-all duration-200 hover:brightness-95"
                    >
                      <Plus className="h-3.5 w-3.5 text-[#0d1b2e]" strokeWidth={2.5} />
                      Add Session
                    </button>
                  }
                />
              </div>
            )}

            {showFocusSplit && (
              <div
                className={`flex min-w-0 flex-1 items-center border-l px-4 transition-colors duration-300 ${
                  isDark
                    ? 'border-white/10 bg-white/5'
                    : 'border-gray-200 bg-amber-50/50'
                }`}
              >
                <p
                  className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-navy'}`}
                >
                  Focus Mode
                </p>
              </div>
            )}
          </div>
        )}

        {/* Calendar content */}
        {settings.simplifiedView ? (
          <SimplifiedView
            leftBlocks={LEFT_BLOCKS}
            rightBlocks={maskedRightBlocks}
            onBook={openBooking}
            onJoin={handleJoinSession}
          />
        ) : showFocusSplit ? (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div
              className={`flex min-w-0 flex-1 flex-col border-r transition-colors duration-300 ${
                isDark ? 'border-white/10' : 'border-gray-200'
              }`}
            >
              <SharedWeekGrid
                viewMode="left"
                leftBlocks={LEFT_BLOCKS}
                rightBlocks={[]}
                confirmedIds={confirmedIds}
                starRatings={starRatings}
                isDark={isDark}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <FocusModeView
                rightBlocks={maskedRightBlocks}
                onBook={openBooking}
              />
            </div>
          </div>
        ) : showFullGrid ? (
          <SharedWeekGrid
            leftBlocks={LEFT_BLOCKS}
            rightBlocks={maskedRightBlocks}
            confirmedIds={confirmedIds}
            starRatings={starRatings}
            onBlockClick={(block) => {
              if (block.clickable) openBooking(block)
            }}
            onMemberJoin={handleJoinSession}
            isDark={isDark}
          />
        ) : null}
      </main>

      <Legend className="shrink-0" />

      <BookingModal
        booking={booking}
        onClose={() => setBooking(null)}
        onUpdate={(patch) =>
          setBooking((b) => (b ? { ...b, ...patch } : null))
        }
        onConfirm={handleBookingConfirm}
      />

      <CreateSessionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSession}
      />

      {reviewVisible && (
        <ReviewPromptCard
          onSubmit={handleReviewSubmit}
          onDismiss={dismissReview}
          dismissing={reviewDismissing}
        />
      )}

      <Toast message={toast ?? ''} visible={!!toast} />

      <AccessibilityPanel />
    </div>
  )
}

function PanelHeader({
  icon,
  title,
  badge,
  badgeClass,
  action,
  incognito,
}: {
  icon: React.ReactNode
  title: string
  badge: string
  badgeClass: string
  action?: React.ReactNode
  isDark?: boolean
}) {
  return (
    <div
      className={`flex w-full shrink-0 items-center justify-between gap-2 px-4 py-2.5 transition-colors duration-300 ${
        isDark ? 'bg-[#1a1a2e]' : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2
          className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-navy'}`}
        >
          {title}
        </h2>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${badgeClass}`}
          style={{ borderRadius: 4 }}
        >
          {badge}
        </span>
      </div>
      {action}
    </div>
  )
}
