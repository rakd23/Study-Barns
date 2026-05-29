export type TextSize = 'small' | 'medium' | 'large'

export interface AccessibilitySettings {
  highContrast: boolean
  colorBlind: boolean
  reducedMotion: boolean
  textSize: TextSize
  focusMode: boolean
  simplifiedView: boolean
  keyboardNav: boolean
  screenReader: boolean
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  colorBlind: false,
  reducedMotion: false,
  textSize: 'medium',
  focusMode: false,
  simplifiedView: false,
  keyboardNav: false,
  screenReader: false,
}

export type AccessibilitySettingKey = keyof AccessibilitySettings

export const SETTING_LABELS: Record<
  Exclude<AccessibilitySettingKey, 'textSize'>,
  string
> = {
  highContrast: 'High Contrast',
  colorBlind: 'Color Blind',
  reducedMotion: 'Reduced Motion',
  focusMode: 'Focus Mode',
  simplifiedView: 'Simplified View',
  keyboardNav: 'Keyboard Navigation',
  screenReader: 'Screen Reader',
}
