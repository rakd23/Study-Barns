const ITEMS = [
  { label: 'ECS 36C', color: 'bg-blue-400' },
  { label: 'BIS 101', color: 'bg-green-500' },
  { label: 'PSC 120', color: 'bg-purple-400' },
  { label: 'Assignment due', color: 'bg-pink-400' },
  { label: 'AATC tutoring', color: 'bg-teal-400' },
  { label: 'Office hours', color: 'bg-[#e76f51]' },
  { label: 'TA hours', color: 'bg-yellow-400' },
  { label: 'Study group', color: 'bg-rose-400' },
]

export function Legend({ className = '' }: { className?: string }) {
  return (
    <footer
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-gray-200 bg-white px-4 py-3 ${className}`}
    >
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className={`h-3 w-3 ${item.color}`} style={{ borderRadius: 6 }} />
          {item.label}
        </div>
      ))}
    </footer>
  )
}
