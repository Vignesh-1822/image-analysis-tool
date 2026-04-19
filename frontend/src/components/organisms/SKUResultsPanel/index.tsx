import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CombinedAnalysisResult } from '@/types/analysis'

interface SKUResultsPanelProps {
  result: CombinedAnalysisResult
  refId: string
  onSearchNew: () => void
}

export function SKUResultsPanel({ result, refId, onSearchNew }: SKUResultsPanelProps) {
  const verdict = result.clip.verdict
  const isApproved = verdict === 'Approved'

  return (
    <div className="flex flex-col gap-4">
      {/* Image */}
      <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100">
        {result.image_url ? (
          <img
            src={result.image_url}
            alt={result.item_number}
            className="w-full object-cover max-h-72"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center text-gray-400 text-sm">
            No image available
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4 flex items-end justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-0.5">Ref ID</p>
            <p className="text-xs font-mono font-bold text-white">{refId}</p>
          </div>
          <span
            className={cn(
              'text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm',
              isApproved ? 'bg-emerald-500 text-white' : 'bg-[#C32032] text-white'
            )}
          >
            {isApproved ? 'Approved' : verdict}
          </span>
        </div>
      </div>

      {/* SKU metadata */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Product Details</p>
        <Row label="Item Number" value={result.item_number} />
        {result.sku_id && <Row label="SKU ID" value={result.sku_id} />}
        {result.hierarchy && <Row label="Category" value={result.hierarchy} />}
        {result.primary_color && <Row label="Color" value={result.primary_color} />}
      </div>

      <Button
        onClick={onSearchNew}
        variant="outline"
        className="w-full rounded-xl text-xs h-9 border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        Search Another SKU
      </Button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className="text-[11px] font-semibold text-gray-700 text-right">{value}</span>
    </div>
  )
}
