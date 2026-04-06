import type { ReactNode } from 'react'

interface QualityMetricCardProps {
  label: string
  value: string
  passed: boolean
  icon: ReactNode
}

export function QualityMetricCard({ label, value, passed, icon }: QualityMetricCardProps) {
  return (
    <div className={`flex flex-col items-center gap-2 py-4 px-3 bg-white border flex-1 ${passed ? 'border-gray-100' : 'border-red-100'}`}>
      <div className={`${passed ? 'text-emerald-500' : 'text-[#C32032]'}`}>
        {icon}
      </div>
      <span className="text-sm font-bold text-gray-800">{value}</span>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold text-center">{label}</span>
    </div>
  )
}
