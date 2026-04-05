import { ConfidenceRing } from '@/components/atoms/ConfidenceRing'
import { ImageQualityRow } from '@/components/molecules/ImageQualityRow'
import { ProductIdentificationCard } from '@/components/molecules/ProductIdentificationCard'
import { SpecificationMatchCard } from '@/components/molecules/SpecificationMatchCard'
import type { CLIPAnalysisResult } from '@/types/analysis'

interface CLIPResultsTabProps {
  result: CLIPAnalysisResult
}

function ringConfig(score: number) {
  if (score >= 75) return { colorClass: 'text-emerald-500', label: 'High Match' }
  if (score >= 50) return { colorClass: 'text-amber-400', label: 'Partial Match' }
  return { colorClass: 'text-[#C32032]', label: 'Low Match' }
}

export function CLIPResultsTab({ result }: CLIPResultsTabProps) {
  const similarityPct = Math.round(result.similarity_score * 100)
  const { colorClass, label } = ringConfig(similarityPct)

  return (
    <div className="grid grid-cols-2 gap-6 pt-2">
      {/* Left: confidence ring + quality */}
      <div>
        <div className="flex justify-center py-4">
          <ConfidenceRing score={similarityPct} label={label} colorClass={colorClass} />
        </div>
        <ImageQualityRow quality={result.quality} />
      </div>

      {/* Right: identification + spec match */}
      <div className="flex flex-col gap-4">
        <ProductIdentificationCard
          productTypeDetected={result.product_type_detected}
          confidence={result.product_type_confidence}
        />
        <SpecificationMatchCard result={result} />
      </div>
    </div>
  )
}
