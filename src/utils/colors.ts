import type { BlockColor } from '../types'

export const BLOCK_STYLES: Record<
  BlockColor,
  { bg: string; border: string; text: string }
> = {
  ecs: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-900' },
  bis: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-900' },
  psc: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-900' },
  assignment: {
    bg: 'bg-pink-100',
    border: 'border-pink-400',
    text: 'text-pink-900',
  },
  aatc: { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-900' },
  oh: {
    bg: 'bg-[#f9a88d]',
    border: 'border-[#e76f51]',
    text: 'text-[#5c2318]',
  },
  'oh-reminder': {
    bg: 'bg-[#fde8dc]',
    border: 'border-[#f4a582]',
    text: 'text-[#7c3d2e]',
  },
  ta: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-900' },
  study: { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-900' },
}
