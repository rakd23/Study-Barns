import { useAccessibility } from '../../accessibility/AccessibilityContext'

export function KeyboardHint({ children }: { children: string }) {
  const { settings } = useAccessibility()
  if (!settings.keyboardNav) return null
  return (
    <span className="mt-0.5 block text-[10px] font-normal text-gray-400">
      {children}
    </span>
  )
}
