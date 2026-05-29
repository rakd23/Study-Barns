import { Star, X } from 'lucide-react'
import { useState } from 'react'
import { useAccessibility } from '../accessibility/AccessibilityContext'

interface ReviewPromptCardProps {
  onSubmit: (rating: number, comment: string) => void
  onDismiss: () => void
  dismissing: boolean
}

export function ReviewPromptCard({
  onSubmit,
  onDismiss,
  dismissing,
}: ReviewPromptCardProps) {
  const { reducedMotion } = useAccessibility()
  const [hoverRating, setHoverRating] = useState(0)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const display = hoverRating || rating

  return (
    <div
      role="dialog"
      aria-labelledby="review-prompt-title"
      className={`fixed bottom-6 right-6 z-40 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-lg border border-gold/40 bg-gradient-to-br from-amber-50 to-white p-4 shadow-xl ${
        reducedMotion
          ? ''
          : `transition-all duration-200 ${dismissing ? 'animate-review-out' : 'animate-review-in'}`
      }`}
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-navy"
        aria-label="Dismiss review"
      >
        <X className="h-4 w-4" />
      </button>

      <h3
        id="review-prompt-title"
        className="pr-6 text-sm font-semibold text-navy"
      >
        Study group · BIS 101 · Apr 22
      </h3>
      <p className="mt-0.5 text-xs text-gray-500">How did it go?</p>

      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(n)}
            className="transition-transform duration-200 hover:scale-110"
            aria-label={`Rate ${n} stars`}
          >
            <Star
              className={`h-6 w-6 transition-colors duration-200 ${
                n <= display
                  ? 'fill-gold text-gold'
                  : 'fill-transparent text-gold/40'
              }`}
            />
          </button>
        ))}
      </div>

      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Help your classmates find the right support"
        className="mt-3 w-full rounded border border-gray-200 px-3 py-2 text-sm transition-colors duration-200 focus:border-gold focus:outline-none"
      />

      <button
        type="button"
        disabled={rating === 0}
        onClick={() => onSubmit(rating, comment)}
        className="mt-3 w-full rounded bg-navy px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Submit Review
      </button>
    </div>
  )
}
