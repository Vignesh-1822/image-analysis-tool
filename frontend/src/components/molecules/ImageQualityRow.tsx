import { Eye, Monitor, Crosshair, Ruler } from 'lucide-react'
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
  const { width, height } = quality.resolution
  return (
    <div className="flex gap-3">
      <QualityMetricCard
        label="Sharpness"
        value={quality.blur.label}
        passed={!quality.blur.is_blurry}
        icon={<Eye className="w-5 h-5" />}
      />
      <QualityMetricCard
        label="Resolution"
        value={resolutionLabel(width)}
        passed={quality.resolution.is_sufficient}
        icon={<Monitor className="w-5 h-5" />}
      />
      <QualityMetricCard
        label="Dimensions"
        value={`${width} × ${height} px`}
        neutral
        icon={<Ruler className="w-5 h-5" />}
      />
      <QualityMetricCard
        label="Framing"
        value={quality.framing.label}
        passed={quality.framing.is_centered}
        icon={<Crosshair className="w-5 h-5" />}
      />
    </div>
  )
}
