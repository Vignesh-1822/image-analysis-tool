import { useState, useRef, useEffect } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'
import { ColorValidationBar } from '@/components/atoms/ColorValidationBar'
import type { ColorComparisonResult } from '@/types/analysis'

interface SpecificationMatchCardProps {
  compositeScore: number
  comparison: ColorComparisonResult | null
}

function buildInfoText(_comparison: ColorComparisonResult | null): string {
  return 'The dominant color is extracted from the product image and compared against the primary color specified in PIM using a perceptual color matching algorithm. If they are within an acceptable range, it is considered a match.'
}

export function SpecificationMatchCard({ compositeScore, comparison }: SpecificationMatchCardProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isMatch = comparison !== null &&
    comparison?.status === 'matched' &&
    (comparison?.match_score ?? 0) >= 75

  const infoText = buildInfoText(comparison)

  return (
    <div ref={ref} className="relative bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        {isMatch ? (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-[#C32032]" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Specification Match
        </span>
        <button
          onClick={() => setOpen(o => !o)}
          className="ml-auto text-gray-300 hover:text-[#004990] transition-colors"
          aria-label="How color matching works"
        >
          <Info className="w-3 h-3" />
        </button>
      </div>

      {open && (
        <div className="absolute top-10 right-4 z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45" />
          <p className="text-[11px] text-gray-600 leading-relaxed">{infoText}</p>
        </div>
      )}

      <div className="px-5 py-4">
        <ColorValidationBar comparison={comparison} />
      </div>
    </div>
  )
}
