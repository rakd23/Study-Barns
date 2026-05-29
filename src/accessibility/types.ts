export type TextSize = 'small' | 'medium' | 'large'

export interface AccessibilitySettings {
  highContrast: boolean
  colorBlind: boolean
  darkMode: boolean
  textSize: TextSize
  focusMode: boolean
  simplifiedView: boolean
  announceBlocks: boolean
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  colorBlind: false,
  darkMode: false,
  textSize: 'medium',
  focusMode: false,
  simplifiedView: false,
  announceBlocks: false,
}

export type AccessibilitySettingKey = keyof AccessibilitySettings

export const SETTING_LABELS: Record<
  Exclude<AccessibilitySettingKey, 'textSize'>,
  string
> = {
  highContrast: 'High Contrast',
  colorBlind: 'Color Blind',
  darkMode: 'Dark Mode',
  focusMode: 'Focus Mode',
  simplifiedView: 'Simplified View',
  announceBlocks: 'Announce Blocks',
}
