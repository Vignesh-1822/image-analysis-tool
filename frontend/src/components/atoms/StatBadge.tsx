interface StatBadgeProps {
  label: string
  value: string
}

export function StatBadge({ label, value }: StatBadgeProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-sm font-bold text-gray-800">{value}</span>
    </div>
  )
}
