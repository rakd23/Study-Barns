import {
  BookOpen,
  Clock,
  FlaskConical,
  GraduationCap,
  Leaf,
  User,
  Users,
} from 'lucide-react'
import type { BlockIconKey } from '../../accessibility/blockVisuals'

const ICONS: Record<
  BlockIconKey,
  React.ComponentType<{ className?: string }>
> = {
  book: BookOpen,
  leaf: Leaf,
  flask: FlaskConical,
  graduation: GraduationCap,
  person: User,
  group: Users,
  clock: Clock,
  users: Users,
}

export function BlockTypeIcon({
  iconKey,
  className = 'h-3 w-3 shrink-0 opacity-90',
}: {
  iconKey: BlockIconKey
  className?: string
}) {
  const Icon = ICONS[iconKey]
  return <Icon className={className} aria-hidden />
}
