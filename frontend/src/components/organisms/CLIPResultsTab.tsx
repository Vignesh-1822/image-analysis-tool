import { ConfidenceRing } from '@/components/atoms/ConfidenceRing'
import { ImageQualityRow } from '@/components/molecules/ImageQualityRow'
import { ProductIdentificationCard } from '@/components/molecules/ProductIdentificationCard'
import { SpecificationMatchCard } from '@/components/molecules/SpecificationMatchCard'
import { VerdictBanner } from '@/components/molecules/VerdictBanner'
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
  const { color, label } = ringConfig(result.composite_score)

  return (
    <div className="flex flex-col gap-6 pt-2">

      {/* Upper: ring left, cards right */}
      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col items-center justify-center bg-gray-50 py-8 px-4">
          <ConfidenceRing
            score={result.composite_score}
            label={label}
            color={color}
            breakdown={[
              {
                label: "Product Type",
                score: result.score_breakdown.product_type?.score ?? 0,
                weight: result.score_breakdown.product_type?.weight ?? 0,
                contribution: result.score_breakdown.product_type?.contribution ?? 0,
              },
              ...(result.score_breakdown.color_match ? [{
                label: "Color Match",
                score: result.score_breakdown.color_match.score,
                weight: result.score_breakdown.color_match.weight,
                contribution: result.score_breakdown.color_match.contribution,
              }] : []),
              {
                label: "Image Quality",
                score: result.score_breakdown.image_quality?.score ?? 0,
                weight: result.score_breakdown.image_quality?.weight ?? 0,
                contribution: result.score_breakdown.image_quality?.contribution ?? 0,
              },
            ]}
          />
        </div>

        <div className="flex flex-col gap-4">
          <ProductIdentificationCard
            isMatch={result.product_type_match}
            detectedType={result.product_type_detected}
          />
          <SpecificationMatchCard
            compositeScore={result.composite_score}
            comparison={result.color?.comparison ?? null}
          />
        </div>
      </div>

      {/* Quality metrics */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Image Quality Metrics
        </p>
        {result.quality && <ImageQualityRow quality={result.quality} />}
      </div>

      {/* Verdict card — inline below quality metrics */}
      <VerdictBanner verdict={result.verdict} verdictNote={result.verdict_note} />

    </div>
  )
}
