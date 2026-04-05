import { CheckCircle, XCircle } from 'lucide-react'

interface QualityMetricCardProps {
  label: string
  value: string
  passed: boolean
}

export function QualityMetricCard({ label, value, passed }: QualityMetricCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-4 px-3 bg-white rounded-xl shadow-sm border border-gray-100 flex-1">
      {passed ? (
        <CheckCircle className="w-5 h-5 text-emerald-500" />
      ) : (
        <XCircle className="w-5 h-5 text-[#C32032]" />
      )}
      <span className="text-sm font-bold text-gray-800">{value}</span>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold text-center">{label}</span>
    </div>
  )
}
