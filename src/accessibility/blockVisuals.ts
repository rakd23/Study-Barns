import type { BlockColor } from '../types'
import type { AccessibilitySettings } from './types'

export interface BlockVisualStyle {
  bg: string
  border: string
  text: string
  subtext: string
  pattern?: string
  iconKey?: BlockIconKey
}

export type BlockIconKey =
  | 'book'
  | 'leaf'
  | 'flask'
  | 'graduation'
  | 'person'
  | 'group'
  | 'clock'
  | 'users'

const NORMAL_STYLES: Record<BlockColor, Omit<BlockVisualStyle, 'pattern' | 'iconKey'>> = {
  ecs: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-900', subtext: 'text-blue-800' },
  bis: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-900', subtext: 'text-green-800' },
  psc: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-900', subtext: 'text-purple-800' },
  assignment: { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-900', subtext: 'text-pink-800' },
  aatc: { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-900', subtext: 'text-teal-800' },
  oh: { bg: 'bg-[#f9a88d]', border: 'border-[#e76f51]', text: 'text-[#5c2318]', subtext: 'text-[#5c2318]' },
  'oh-reminder': { bg: 'bg-[#fde8dc]', border: 'border-[#f4a582]', text: 'text-[#7c3d2e]', subtext: 'text-[#7c3d2e]' },
  ta: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-900', subtext: 'text-yellow-800' },
  study: { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-900', subtext: 'text-rose-800' },
}

const HIGH_CONTRAST_STYLES: Record<BlockColor, Omit<BlockVisualStyle, 'pattern' | 'iconKey'>> = {
  ecs: { bg: 'bg-[#1d4ed8]', border: 'border-black', text: 'text-white', subtext: 'text-white' },
  bis: { bg: 'bg-[#15803d]', border: 'border-black', text: 'text-white', subtext: 'text-white' },
  psc: { bg: 'bg-[#7e22ce]', border: 'border-black', text: 'text-white', subtext: 'text-white' },
  assignment: { bg: 'bg-[#be185d]', border: 'border-black', text: 'text-white', subtext: 'text-white' },
  aatc: { bg: 'bg-[#0f766e]', border: 'border-black', text: 'text-white', subtext: 'text-white' },
  oh: { bg: 'bg-[#c2410c]', border: 'border-black', text: 'text-white', subtext: 'text-white' },
  'oh-reminder': { bg: 'bg-[#ea580c]', border: 'border-black', text: 'text-white', subtext: 'text-white' },
  ta: { bg: 'bg-[#a16207]', border: 'border-black', text: 'text-white', subtext: 'text-white' },
  study: { bg: 'bg-[#be123c]', border: 'border-black', text: 'text-white', subtext: 'text-white' },
}

const COLOR_BLIND_META: Record<
  BlockColor,
  { iconKey: BlockIconKey; pattern: string }
> = {
  ecs: { iconKey: 'book', pattern: '' },
  bis: { iconKey: 'leaf', pattern: '' },
  psc: { iconKey: 'flask', pattern: '' },
  assignment: { iconKey: 'clock', pattern: '' },
  aatc: { iconKey: 'graduation', pattern: 'a11y-pattern-diagonal' },
  oh: { iconKey: 'person', pattern: 'a11y-pattern-dots' },
  'oh-reminder': { iconKey: 'person', pattern: 'a11y-pattern-dots' },
  ta: { iconKey: 'person', pattern: 'a11y-pattern-dots' },
  study: { iconKey: 'group', pattern: 'a11y-pattern-crosshatch' },
}

export function getBlockVisualStyle(
  color: BlockColor,
  settings: AccessibilitySettings,
): BlockVisualStyle {
  const base = settings.highContrast
    ? HIGH_CONTRAST_STYLES[color]
    : NORMAL_STYLES[color]

  if (!settings.colorBlind) {
    return { ...base }
  }

  const meta = COLOR_BLIND_META[color]
  return {
    ...base,
    iconKey: meta.iconKey,
    pattern: meta.pattern || undefined,
  }
}
