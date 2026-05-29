import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  type AccessibilitySettings,
  type TextSize,
} from './types'

const STORAGE_KEY = 'studybarns-a11y'

export function loadAccessibilitySettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_ACCESSIBILITY_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>
    return {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      ...parsed,
      textSize: isTextSize(parsed.textSize)
        ? parsed.textSize
        : DEFAULT_ACCESSIBILITY_SETTINGS.textSize,
    }
  } catch {
    return { ...DEFAULT_ACCESSIBILITY_SETTINGS }
  }
}

export function saveAccessibilitySettings(settings: AccessibilitySettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

function isTextSize(v: unknown): v is TextSize {
  return v === 'small' || v === 'medium' || v === 'large'
}
