import { CheckCircle, XCircle } from 'lucide-react'
import { ColorValidationBar } from '@/components/atoms/ColorValidationBar'
import type { CLIPAnalysisResult } from '@/types/analysis'

interface SpecificationMatchCardProps {
  result: CLIPAnalysisResult
}

export function SpecificationMatchCard({ result }: SpecificationMatchCardProps) {
  // composite_score is the overall weighted match (0-100)
  const similarity = result.composite_score
  const isMatch = similarity >= 75
  const barColor = isMatch ? 'bg-emerald-500' : similarity >= 50 ? 'bg-amber-400' : 'bg-[#C32032]'
  const textColor = isMatch ? 'text-emerald-600' : similarity >= 50 ? 'text-amber-600' : 'text-[#C32032]'
  const comparison = result.color.comparison

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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

      <div className="px-5 py-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Overall Match Score</span>
            <span className={`text-xs font-bold ${textColor}`}>{similarity.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${similarity}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400">
            {isMatch ? 'Meets specification criteria' : similarity >= 50 ? 'Partial specification match' : 'Does not meet specification'}
          </p>
        </div>

        {comparison && comparison.match_score !== null && comparison.target_hex !== null ? (
          <ColorValidationBar
            matchScore={comparison.match_score}
            extractedHex={comparison.extracted_hex}
            targetHex={comparison.target_hex}
            targetColorName={comparison.target_color_name}
          />
        ) : comparison ? (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Color Match</span>
            <p className="text-xs text-gray-400 italic">{comparison.match_label}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
