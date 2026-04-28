import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CombinedAnalysisResult } from '@/types/analysis'

interface SKUResultsPanelProps {
  result: CombinedAnalysisResult
  refId: string
  onSearchNew: () => void
}

const verdictStyle: Record<string, string> = {
  'Approved':     'bg-emerald-500 text-white',
  'Catalog Only': 'bg-amber-500 text-white',
  'Replace':      'bg-[#C32032] text-white',
}

export function SKUResultsPanel({ result, refId, onSearchNew }: SKUResultsPanelProps) {
  const verdict = result.clip.verdict

  return (
    <div className="flex flex-col gap-4">
      {/* Image */}
      <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100">
        {result.image_url ? (
          <img
            src={result.image_url}
            alt={result.item_number}
            className="w-full object-cover max-h-60"
          />
        ) : (
          <div className="w-full h-44 flex items-center justify-center text-gray-400 text-sm">
            No image available
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3.5 flex items-end justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-0.5">Ref ID</p>
            <p className="text-xs font-mono font-bold text-white">{refId}</p>
          </div>
          <span className={cn('text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded', verdictStyle[verdict] ?? verdictStyle['Replace'])}>
            {verdict}
          </span>
        </div>
      </div>

      {/* Product Details card */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Details</p>
        </div>

        <div className="px-4 py-1 flex flex-col divide-y divide-gray-50">
          <Row label="Item Number" value={result.item_number} mono />
          {result.sku_id && <Row label="SKU ID" value={result.sku_id} mono />}
          {result.hierarchy && <Row label="Category" value={result.hierarchy} />}
          {result.primary_color && <Row label="Color" value={result.primary_color} />}
        </div>

        {result.long_description && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Description</p>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{result.long_description}</p>
          </div>
        )}
      </div>

      <Button
        onClick={onSearchNew}
        variant="outline"
        className="w-full text-xs h-11 bg-[#004990] hover:bg-[#003a7a] hover:text-white text-white text-sm font-semibold"
      >
        Search Another SKU
      </Button>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={cn('text-xs font-semibold text-gray-800 text-right', mono && 'font-mono')}>{value}</span>
    </div>
  )
}
