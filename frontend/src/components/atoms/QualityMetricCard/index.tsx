import { CheckCircle, XCircle } from 'lucide-react'

interface QualityMetricCardProps {
  label: string
  value: string
  passed: boolean
}

export function QualityMetricCard({ label, value, passed }: QualityMetricCardProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-3 px-4 bg-gray-50 border border-gray-200 flex-1">
      <div className="flex items-center gap-1.5">
        {passed ? (
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-[#C32032] shrink-0" />
        )}
        <span className="text-xs font-semibold text-gray-700">{value}</span>
      </div>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
  )
}
