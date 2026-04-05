import { CheckCircle } from 'lucide-react'

interface ProductIdentificationCardProps {
  productTypeDetected: string
  confidence: number  // 0–100, already a percentage
}

export function ProductIdentificationCard({
  productTypeDetected,
  confidence,
}: ProductIdentificationCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Product Identification
        </span>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        <div>
          <p className="text-sm font-bold text-gray-800 capitalize">{productTypeDetected}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-0.5">
            Validated Product
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Detection Confidence</span>
            <span className="text-xs font-bold text-gray-800">{confidence.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#004990] rounded-full transition-all duration-500"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
