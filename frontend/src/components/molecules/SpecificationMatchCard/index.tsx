import { CheckCircle, XCircle } from 'lucide-react'
import { ColorValidationBar } from '@/components/atoms/ColorValidationBar'
import type { CLIPAnalysisResult } from '@/types/analysis'

interface SpecificationMatchCardProps {
  result: CLIPAnalysisResult
}

export function SpecificationMatchCard({ result }: SpecificationMatchCardProps) {
  const similarity = Math.round(result.similarity_score * 100)
  const isMatch = similarity >= 60
  const comparison = result.color.comparison

  return (
    <div className="border border-gray-200 bg-white border-l-4 border-l-[#004990]">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        {isMatch ? (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-[#C32032]" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Specification Match
        </span>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Text similarity */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Visual-Text Similarity</span>
            <span className={`text-xs font-bold ${isMatch ? 'text-emerald-600' : 'text-[#C32032]'}`}>
              {similarity}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 w-full">
            <div
              className={`h-full transition-all duration-500 ${isMatch ? 'bg-emerald-500' : 'bg-[#C32032]'}`}
              style={{ width: `${similarity}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {isMatch ? `Matches spec` : 'Specification mismatch'}
          </p>
        </div>

        {/* Color match */}
        {comparison && (
          <ColorValidationBar
            matchScore={comparison.match_score * 100}
            extractedHex={comparison.extracted_hex}
            targetHex={comparison.target_hex}
            targetColorName={comparison.target_color_name}
          />
        )}
      </div>
    </div>
  )
}
