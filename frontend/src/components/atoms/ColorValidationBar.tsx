import { AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { ColorComparisonResult } from '@/types/analysis'

interface ColorValidationBarProps {
  comparison: ColorComparisonResult | null
}

export function ColorValidationBar({ comparison }: ColorValidationBarProps) {
  if (!comparison) {
    return <MutedCard message="No primary color specified for this product" />
  }

  const { status } = comparison

  if (status === 'no_data') {
    return <MutedCard message="No primary color specified for this product" />
  }

  if (status === 'not_applicable') {
    return <MutedCard message="Color not applicable for this product type" />
  }

  if (status === 'transparent') {
    return <MutedCard message="Transparent material — color validation skipped" />
  }

  if (status === 'multicolored') {
    return (
      <Card className="p-4 flex flex-col gap-3 border-gray-100 shadow-none">
        <Label text="Color Validation" />
        <p className="text-xs text-gray-500">Multicolored product — extracted colors shown</p>
        {comparison.extracted_hex && (
          <Swatch hex={comparison.extracted_hex} label={`Extracted ${comparison.extracted_hex}`} />
        )}
      </Card>
    )
  }

  const score = comparison.match_score ?? 0
  const isGood = score >= 75
  const isFair = score >= 50
  const barColor = isGood ? 'bg-emerald-500' : isFair ? 'bg-amber-400' : 'bg-[#C32032]'
  const textColor = isGood ? 'text-emerald-600' : isFair ? 'text-amber-600' : 'text-[#C32032]'
  const isUnknown = status === 'unknown_color'

  return (
    <Card className="p-4 flex flex-col gap-3 border-gray-100 shadow-none">
      <div className="flex items-center justify-between">
        <Label text="Color Match" />
        <div className="flex items-center gap-1">
          {isUnknown && <AlertTriangle className="w-3 h-3 text-amber-500" />}
          <span className={`text-xs font-bold ${isUnknown ? 'text-amber-600' : textColor}`}>
            {score.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
        <div
          className={`h-full ${isUnknown ? 'bg-amber-400' : barColor} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {isUnknown && (
        <p className="text-[10px] text-amber-600 italic">
          Approximate match — color not in reference
        </p>
      )}

      <div className="flex items-center gap-4">
        {comparison.extracted_hex && (
          <Swatch hex={comparison.extracted_hex} label={`Extracted ${comparison.extracted_hex}`} />
        )}
        {comparison.target_hex && (
          <Swatch hex={comparison.target_hex} label={comparison.target_color_name ?? 'Target'} />
        )}
      </div>
    </Card>
  )
}

function Label({ text }: { text: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{text}</span>
  )
}

function MutedCard({ message }: { message: string }) {
  return (
    <Card className="p-4 flex flex-col gap-1 border-gray-100 shadow-none bg-gray-50">
      <Label text="Color Validation" />
      <p className="text-xs text-gray-400 italic">{message}</p>
    </Card>
  )
}

function Swatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-3.5 h-3.5 rounded-sm border border-gray-200 shrink-0"
        style={{ backgroundColor: hex }}
      />
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
    </div>
  )
}
