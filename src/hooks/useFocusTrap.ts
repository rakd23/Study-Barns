import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false
  const tag = (el as HTMLElement).tagName
  return (
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    (tag === 'INPUT' &&
      !['button', 'submit', 'reset', 'checkbox', 'radio'].includes(
        (el as HTMLInputElement).type,
      ))
  )
}

export function useFocusTrap(
  active: boolean,
  onEscape?: () => void,
  returnFocusRef?: React.RefObject<HTMLElement | null>,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    previousFocus.current = document.activeElement as HTMLElement | null
    const container = containerRef.current
    if (!container) return

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))

    const t = window.setTimeout(() => {
      const first = focusables()[0]
      first?.focus()
    }, 0)

    const onKeyDown = (e: KeyboardEvent) => {
      // Never intercept keystrokes when the user is typing in a text field
      if (isTypingTarget(document.activeElement)) {
        // Only handle Escape even in text fields
        if (e.key === 'Escape') {
          onEscape?.()
        }
        return
      }

      if (e.key === 'Escape') {
        onEscape?.()
        return
      }
      if (e.key !== 'Tab') return

      const nodes = focusables()
      if (nodes.length === 0) return

      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKeyDown)
      const returnEl = returnFocusRef?.current ?? previousFocus.current
      returnEl?.focus()
    }
  }, [active, onEscape, returnFocusRef])

  return containerRef
}
