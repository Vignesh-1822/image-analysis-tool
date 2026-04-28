import { Eye, Monitor, Crosshair, Ruler, Scan } from 'lucide-react'
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

function sharpnessInfo(blur: QualityResult['blur']): string {
  const level = blur.score >= 100
    ? 'very high, meaning the image has crisp, well-defined edges'
    : blur.score >= 50
    ? 'moderate — edges are detectable but some softness is present'
    : 'low, indicating the image is too blurry for reliable analysis'
  return `Sharpness is measured by analysing edge contrast across the image (Laplacian variance). A score of ${blur.score.toFixed(0)} is ${level}.`
}

function dpiInfo(dpi: number | null, width: number, height: number): string {
  if (dpi == null) {
    return 'DPI (dots per inch) is the number of pixels contained in one inch of the image. This image has no DPI tag embedded in its metadata.'
  }
  const wIn = (width / dpi).toFixed(2)
  const hIn = (height / dpi).toFixed(2)
  return `DPI (dots per inch) is the number of pixels in one inch of this image — ${dpi} pixels per inch. At this density, the image measures ${wIn} × ${hIn} inches in physical size.`
}

function framingInfo(framing: QualityResult['framing']): string {
  if (framing.label === 'Full Frame') {
    return 'This image is a texture or pattern shot where the product fills the entire frame — no isolated object was detected. Framing analysis does not apply to this image type.'
  }
  const offsetPct = (framing.centroid_offset * 100).toFixed(1)
  const context = framing.centroid_offset < 0.15
    ? 'well within the centered threshold — the product fills the frame as expected'
    : framing.centroid_offset < 0.30
    ? 'slightly off-center, which may affect visual comparison accuracy'
    : 'significantly off-center, which can reduce the accuracy of product matching'
  return `Framing measures how centered the product is by detecting the main subject's position. An offset of ${offsetPct}% is ${context}.`
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
        info={sharpnessInfo(quality.blur)}
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
        label="DPI"
        value={quality.resolution.dpi != null ? `${quality.resolution.dpi} dpi` : 'Not embedded'}
        neutral
        icon={<Scan className="w-5 h-5" />}
        info={dpiInfo(quality.resolution.dpi, width, height)}
      />
      <QualityMetricCard
        label="Framing"
        value={quality.framing.label}
        passed={quality.framing.is_centered}
        icon={<Crosshair className="w-5 h-5" />}
        info={framingInfo(quality.framing)}
      />
    </div>
  )
}
