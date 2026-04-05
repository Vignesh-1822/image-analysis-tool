import { FileText } from 'lucide-react'
import type { ParsedDescription } from '@/types/analysis'

interface ProductDescriptionCardProps {
  description: string
  parsed: ParsedDescription | null
}

export function ProductDescriptionCard({ description, parsed }: ProductDescriptionCardProps) {
  return (
    <div className="border border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-[#004990]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Product Description
        </span>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>

        {parsed && (
          <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
            {parsed.brand && <Row label="Brand" value={parsed.brand} />}
            {parsed.product_line && <Row label="Line" value={parsed.product_line} />}
            {parsed.color && <Row label="Color" value={parsed.color} />}
            {parsed.style && <Row label="Style" value={parsed.style} />}
            {parsed.product_type !== 'unknown' && (
              <Row label="Type" value={parsed.product_type} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 w-12 shrink-0 pt-px">
        {label}
      </span>
      <span className="text-xs text-gray-700">{value}</span>
    </div>
  )
}
