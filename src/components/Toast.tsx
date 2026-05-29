import { useAccessibility } from '../accessibility/AccessibilityContext'

interface ToastProps {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: ToastProps) {
  const { reducedMotion } = useAccessibility()
  if (!visible) return null
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-navy px-5 py-3 text-sm text-white shadow-lg ${
        reducedMotion ? '' : 'transition-all duration-200'
      }`}
      role="status"
    >
      {message}
    </div>
  )
}
