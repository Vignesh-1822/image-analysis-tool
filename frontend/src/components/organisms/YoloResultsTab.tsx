import { ConfidenceRing } from '@/components/atoms/ConfidenceRing'
import { ImageQualityRow } from '@/components/molecules/ImageQualityRow'
import { ProductIdentificationCard } from '@/components/molecules/ProductIdentificationCard'
import { SpecificationMatchCard } from '@/components/molecules/SpecificationMatchCard'
import { VerdictBanner } from '@/components/molecules/VerdictBanner'
import type { YoloSamAnalysisResult } from '@/types/analysis'

interface YoloResultsTabProps {
  result: YoloSamAnalysisResult
  segmentedImage?: string | null
}

function ringConfig(score: number): { color: string; label: string } {
  if (score >= 75) return { color: '#22c55e', label: 'High Match' }
  if (score >= 50) return { color: '#f59e0b', label: 'Partial Match' }
  return { color: '#C32032', label: 'Low Match' }
}

export function YoloResultsTab({ result, segmentedImage }: YoloResultsTabProps) {
  const { color, label } = ringConfig(result.composite_score)

  const breakdown = result.score_breakdown
    ? [
      {
        label: "Detection",
        score: result.score_breakdown.detection.score,
        weight: result.score_breakdown.detection.weight,
        contribution: result.score_breakdown.detection.contribution,
      },
      ...(result.score_breakdown.color_match
        ? [
          {
            label: "Color Match",
            score: result.score_breakdown.color_match.score,
            weight: result.score_breakdown.color_match.weight,
            contribution: result.score_breakdown.color_match.contribution,
          },
        ]
        : []),
      {
        label: "Image Quality",
        score: result.score_breakdown.image_quality.score,
        weight: result.score_breakdown.image_quality.weight,
        contribution: result.score_breakdown.image_quality.contribution,
      },
    ]
    : [
      {
        label: "Segment Area",
        score: result.mask_area_percent,
        weight: 100,
        contribution: result.mask_area_percent,
      },
    ]

  return (
    <div className="flex flex-col gap-6 pt-2">

      {/* Upper: ring left, cards right */}
      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col items-center justify-center bg-gray-50 py-8 px-4 rounded-xl border border-gray-100">
          <ConfidenceRing
            score={result.composite_score}
            label={label}
            color={color}
            breakdown={breakdown}
          />
        </div>

        <div className="flex flex-col gap-4">
          {result.status === 'skipped_no_object' ? (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg shadow-sm text-[#004990]">
              <p className="font-bold text-sm mb-1">Texture Pattern Detected</p>
              <p className="text-xs opacity-80 leading-relaxed">
                YOLO found no central object — full-frame texture product image.
                Segmentation was bypassed to preserve image edges.
              </p>
            </div>
          ) : (
            <ProductIdentificationCard
              isMatch={result.product_type_match}
              detectedType={result.product_type_detected ?? `YOLO Class: ${result.class_name || 'None'}`}
            />
          )}

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
        {result.quality ? (
          <ImageQualityRow quality={result.quality} />
        ) : (
          <div className="flex items-center justify-center py-8 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-400">
            Quality data not available
          </div>
        )}
      </div>

      {/* Segmented image */}
      {/* <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Pipeline Segmented Output
        </p>
        {segmentedImage ? (
          <div className="flex flex-col items-center justify-center py-6 bg-white border border-gray-100 rounded-xl shadow-sm min-h-[300px]">
            <img
              src={`data:image/jpeg;base64,${segmentedImage}`}
              alt="YOLO Segmentation"
              className="max-w-full max-h-[400px] object-contain rounded-md"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-2 bg-gray-50 border border-gray-100 text-gray-400 rounded-xl min-h-[300px]">
            <span className="text-sm font-semibold">YOLO+SAM2 Segmentation</span>
            <span className="text-xs">No segmented image available</span>
          </div>
        )}
      </div> */}

      {/* Detection details */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Detection Details
        </p>
        <div className="grid grid-cols-4 gap-3">
          <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <span className="text-lg font-bold text-gray-800">{result.class_name || '—'}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">YOLO Class</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <span className="text-lg font-bold text-gray-800">{result.confidence}%</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Confidence</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <span className="text-lg font-bold text-gray-800">{result.mask_area_percent}%</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Mask Area</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <span className="text-lg font-bold text-gray-800">{result.processing_time_ms}ms</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Processing</span>
          </div>
        </div>
      </div>

      {/* Verdict */}
      <VerdictBanner verdict={result.verdict} verdictNote={result.verdict_note} />

    </div>
  )
}
