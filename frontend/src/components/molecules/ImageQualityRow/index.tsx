import { QualityMetricCard } from '@/components/atoms/QualityMetricCard'
import type { QualityResult } from '@/types/analysis'

interface ImageQualityRowProps {
  quality: QualityResult
}

function resolutionLabel(width: number): string {
  if (width >= 3840) return '4K Native'
  if (width >= 2560) return 'QHD'
  if (width >= 1920) return 'Full HD'
  if (width >= 1280) return 'HD'
  return `${width}px`
}

export function ImageQualityRow({ quality }: ImageQualityRowProps) {
  return (
    <div className="flex gap-3">
      <QualityMetricCard
        label="Sharpness"
        value={quality.blur.label}
        passed={!quality.blur.is_blurry}
      />
      <QualityMetricCard
        label="Resolution"
        value={resolutionLabel(quality.resolution.width)}
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
