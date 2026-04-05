import { FileText } from 'lucide-react'
import type { ParsedDescription } from '@/types/analysis'

interface ProductDescriptionCardProps {
  description: string
  parsed: ParsedDescription | null
}

function colorNameToHex(name: string): string {
  const l = name.toLowerCase()
  if (l.includes('black') || l.includes('dark') || l.includes('charcoal')) return '#2C2C2C'
  if (l.includes('gray') || l.includes('grey') || l.includes('slate')) return '#6B7280'
  if (l.includes('brown') || l.includes('tan') || l.includes('sienna')) return '#92400E'
  if (l.includes('red') || l.includes('rustic') || l.includes('terracotta')) return '#B91C1C'
  if (l.includes('blue') || l.includes('navy')) return '#1E40AF'
  if (l.includes('green') || l.includes('hunter')) return '#166534'
  if (l.includes('white') || l.includes('light') || l.includes('cream')) return '#D1D5DB'
  return '#9CA3AF'
}

export function ProductDescriptionCard({ description, parsed }: ProductDescriptionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-[#004990]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Product Details
        </span>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        {parsed && (
          <div className="flex flex-col gap-2.5">
            {parsed.product_type !== 'unknown' && (
              <Row label="Classification" value={parsed.product_type} capitalize />
            )}
            {parsed.color && (
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 w-24 shrink-0 pt-0.5">
                  Color Spec
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                    style={{ backgroundColor: colorNameToHex(parsed.color) }}
                  />
                  <span className="text-xs font-semibold text-gray-700">{parsed.color}</span>
                </div>
              </div>
            )}
            {parsed.style && <Row label="Pattern Style" value={parsed.style} />}
            {parsed.brand && <Row label="Brand" value={parsed.brand} />}
            {parsed.product_line && <Row label="Product Line" value={parsed.product_line} />}
          </div>
        )}

        <div className={parsed ? 'pt-3 border-t border-gray-100' : ''}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Technical Summary
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 w-24 shrink-0 pt-0.5">
        {label}
      </span>
      <span className={`text-xs font-semibold text-gray-700 ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </span>
    </div>
  )
}
