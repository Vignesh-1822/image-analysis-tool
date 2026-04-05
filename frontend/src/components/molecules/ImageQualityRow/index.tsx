import { QualityMetricCard } from '@/components/atoms/QualityMetricCard'
import type { QualityResult } from '@/types/analysis'

interface ImageQualityRowProps {
  quality: QualityResult
}

export function ImageQualityRow({ quality }: ImageQualityRowProps) {
  const resolutionLabel =
    quality.resolution.width >= 3840
      ? '4K Native'
      : quality.resolution.width >= 1920
      ? 'Full HD'
      : `${quality.resolution.width}px`

  return (
    <div className="flex gap-2 mt-4">
      <QualityMetricCard
        label="Sharpness"
        value={quality.blur.label}
        passed={!quality.blur.is_blurry}
      />
      <QualityMetricCard
        label="Resolution"
        value={resolutionLabel}
        passed={quality.resolution.is_sufficient}
      />
      <QualityMetricCard
        label="Framing"
        value={quality.framing.label}
        passed={quality.framing.is_centered}
      />
    </div>
  )
}
