import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  loadAccessibilitySettings,
  saveAccessibilitySettings,
} from './storage'
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  SETTING_LABELS,
  type AccessibilitySettingKey,
  type AccessibilitySettings,
  type TextSize,
} from './types'

interface AccessibilityContextValue {
  settings: AccessibilitySettings
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  focusPanelExpanded: boolean
  setFocusPanelExpanded: (expanded: boolean) => void
  incognito: boolean
  setIncognito: (on: boolean) => void
  setSetting: <K extends AccessibilitySettingKey>(
    key: K,
    value: AccessibilitySettings[K],
  ) => void
  toggleSetting: (key: Exclude<AccessibilitySettingKey, 'textSize'>) => void
  setTextSize: (size: TextSize) => void
  activeSettingLabels: {
    key: Exclude<AccessibilitySettingKey, 'textSize'> | 'textSize'
    label: string
  }[]
  reducedMotion: boolean
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

const TEXT_SCALE: Record<TextSize, number> = {
  small: 0.85,
  medium: 1,
  large: 1.2,
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() =>
    loadAccessibilitySettings(),
  )
  const [panelOpen, setPanelOpen] = useState(false)
  const [focusPanelExpanded, setFocusPanelExpanded] = useState(false)
  const [incognito, setIncognito] = useState(false)

  const reducedMotion = settings.reducedMotion

  useEffect(() => {
    saveAccessibilitySettings(settings)
  }, [settings])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('a11y-high-contrast', settings.highContrast)
    root.classList.toggle('a11y-reduced-motion', settings.reducedMotion)
    root.classList.toggle('a11y-keyboard-nav', settings.keyboardNav)
    root.style.setProperty('--a11y-text-scale', String(TEXT_SCALE[settings.textSize]))
  }, [settings])

  const setSetting = useCallback(
    <K extends AccessibilitySettingKey>(
      key: K,
      value: AccessibilitySettings[K],
    ) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const toggleSetting = useCallback(
    (key: Exclude<AccessibilitySettingKey, 'textSize'>) => {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    },
    [],
  )

  const setTextSize = useCallback((size: TextSize) => {
    setSettings((prev) => ({ ...prev, textSize: size }))
  }, [])

  const activeSettingLabels = useMemo(() => {
    const keys = Object.keys(SETTING_LABELS) as Exclude<
      AccessibilitySettingKey,
      'textSize'
    >[]
    const active = keys.filter((key) => settings[key])
    if (settings.textSize !== 'medium') {
      return [
        ...active.map((key) => ({ key, label: SETTING_LABELS[key] })),
        {
          key: 'textSize' as const,
          label:
            settings.textSize === 'small' ? 'Small Text' : 'Large Text',
        },
      ]
    }
    return active.map((key) => ({ key, label: SETTING_LABELS[key] }))
  }, [settings])

  const value = useMemo(
    () => ({
      settings,
      panelOpen,
      setPanelOpen,
      focusPanelExpanded,
      setFocusPanelExpanded,
      incognito,
      setIncognito,
      setSetting,
      toggleSetting,
      setTextSize,
      activeSettingLabels,
      reducedMotion,
    }),
    [
      settings,
      panelOpen,
      focusPanelExpanded,
      incognito,
      setSetting,
      toggleSetting,
      setTextSize,
      activeSettingLabels,
      reducedMotion,
    ],
  )

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return ctx
}

export function useAccessibilityOptional() {
  return useContext(AccessibilityContext)
}

export { DEFAULT_ACCESSIBILITY_SETTINGS }
