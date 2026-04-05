import { Tag } from 'lucide-react'

interface ProductIdentificationCardProps {
  productTypeDetected: string
  confidence: number
}

export function ProductIdentificationCard({
  productTypeDetected,
  confidence,
}: ProductIdentificationCardProps) {
  return (
    <div className="border border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Tag className="w-3.5 h-3.5 text-[#004990]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Product Identification
        </span>
      </div>
      <div className="px-4 py-4 flex flex-col gap-1">
        <p className="text-sm font-bold text-gray-800">
          Validated Product:{' '}
          <span className="capitalize">{productTypeDetected}</span>
        </p>
        <p className="text-xs text-gray-500">
          Confidence:{' '}
          <span className="font-semibold text-gray-700">
            {(confidence * 100).toFixed(0)}%
          </span>
        </p>
      </div>
    </div>
  )
}
