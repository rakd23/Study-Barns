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
      const nodes = focusables()
      const firstInput = nodes.find(
        (el) =>
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' ||
          (el.tagName === 'INPUT' &&
            !['button', 'submit', 'reset'].includes((el as HTMLInputElement).type)),
      )
      const target = firstInput ?? nodes[0]
      target?.focus()
    }, 50)

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(document.activeElement)) {
        if (e.key === 'Escape') onEscape?.()
        return
      }
      if (e.key === 'Escape') { onEscape?.(); return }
      if (e.key !== 'Tab') return
      const nodes = focusables()
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
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
