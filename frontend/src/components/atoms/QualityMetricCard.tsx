import type { ReactNode } from 'react'

interface QualityMetricCardProps {
  label: string
  value: string
  icon: ReactNode
  passed?: boolean
  neutral?: boolean
}

export function QualityMetricCard({ label, value, icon, passed, neutral }: QualityMetricCardProps) {
  const borderClass = neutral ? 'border-gray-100' : passed ? 'border-gray-100' : 'border-red-100'
  const iconClass = neutral ? 'text-gray-400' : passed ? 'text-emerald-500' : 'text-[#C32032]'

  return (
    <div className={`flex flex-col items-center gap-2 py-4 px-3 bg-white border flex-1 ${borderClass}`}>
      <div className={iconClass}>
        {icon}
      </div>
      <span className="text-sm font-bold text-gray-800">{value}</span>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold text-center">{label}</span>
    </div>
  )
}
