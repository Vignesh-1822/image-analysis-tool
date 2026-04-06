import { ConfidenceRing } from '@/components/atoms/ConfidenceRing'
import { ImageQualityRow } from '@/components/molecules/ImageQualityRow'
import { ProductIdentificationCard } from '@/components/molecules/ProductIdentificationCard'
import { SpecificationMatchCard } from '@/components/molecules/SpecificationMatchCard'
import type { CLIPAnalysisResult } from '@/types/analysis'

interface CLIPResultsTabProps {
  result: CLIPAnalysisResult
}

function ringConfig(score: number): { color: string; label: string } {
  if (score >= 75) return { color: '#22c55e', label: 'High Match' }
  if (score >= 50) return { color: '#f59e0b', label: 'Partial Match' }
  return { color: '#C32032', label: 'Low Match' }
}

export function CLIPResultsTab({ result }: CLIPResultsTabProps) {
  // composite_score is the main 0-100 number driving the ring
  const { color, label } = ringConfig(result.composite_score)

  return (
    <div className="flex flex-col gap-6 pt-2">

      {/* Upper: ring left, cards right */}
      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl py-8 px-4">
          <ConfidenceRing
            score={result.composite_score}
            label={label}
            color={color}
          />
        </div>

        <div className="flex flex-col gap-4">
          <ProductIdentificationCard
            productTypeDetected={result.product_type_detected}
            confidence={result.product_type_confidence}
          />
          <SpecificationMatchCard result={result} />
        </div>
      </div>

      {/* Lower: quality metrics row */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Image Quality Metrics
        </p>
        <ImageQualityRow quality={result.quality} />
      </div>

    </div>
  )
}
