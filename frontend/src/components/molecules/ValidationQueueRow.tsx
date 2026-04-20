import { ChevronRight } from 'lucide-react'
import { VerdictBadge } from '@/components/atoms/VerdictBadge'

interface ValidationQueueRowProps {
  itemNumber: string
  productName: string
  score: number
  verdict: string
  onViewDetails: () => void
}

function scoreColor(score: number) {
  if (score >= 75) return 'border-emerald-500 text-emerald-600'
  if (score >= 50) return 'border-orange-500 text-orange-600'
  return 'border-[#C32032] text-[#C32032]'
}

export function ValidationQueueRow({
  itemNumber,
  productName,
  score,
  verdict,
  onViewDetails,
}: ValidationQueueRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-mono text-xs text-gray-500">{itemNumber}</td>
      <td className="px-6 py-4 font-semibold text-gray-900 text-sm">{productName}</td>
      <td className="px-6 py-4">
        <div className="flex justify-center">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${scoreColor(score)}`}>
            {score}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <VerdictBadge verdict={verdict} />
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={onViewDetails}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#004990] hover:bg-blue-50 px-3 py-1.5 rounded transition-all"
        >
          VIEW DETAILS
          <ChevronRight className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}
