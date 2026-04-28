import { CheckCircle, XCircle } from 'lucide-react'
import { ColorValidationBar } from '@/components/atoms/ColorValidationBar'
import type { ColorComparisonResult } from '@/types/analysis'

interface SpecificationMatchCardProps {
  compositeScore: number
  comparison: ColorComparisonResult | null
}

export function SpecificationMatchCard({ compositeScore, comparison }: SpecificationMatchCardProps) {
  const isMatch = comparison !== null &&
    comparison?.status === 'matched' &&
    (comparison?.match_score ?? 0) >= 75

  return (
    <div className="bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        {isMatch ? (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-[#C32032]" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Specification Match
        </span>
      </div>

      <div className="px-5 py-4">
        <ColorValidationBar comparison={comparison} />
      </div>
    </div>
  )
}
