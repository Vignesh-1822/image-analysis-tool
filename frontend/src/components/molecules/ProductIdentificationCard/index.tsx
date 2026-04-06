import { CheckCircle, XCircle } from 'lucide-react'

interface ProductIdentificationCardProps {
  isMatch: boolean
  detectedType: string
}

export function ProductIdentificationCard({ isMatch, detectedType }: ProductIdentificationCardProps) {
  return (
    <div className={`border overflow-hidden ${isMatch ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className={`px-5 py-3.5 border-b flex items-center justify-between ${isMatch ? 'border-green-200' : 'border-red-200'}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Product Identification
        </span>
        {isMatch ? (
          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-red-600" />
        )}
      </div>

      <div className="px-5 py-4 flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isMatch ? 'bg-green-500' : 'bg-red-500'}`} />
        <p className={`text-sm font-semibold ${isMatch ? 'text-green-700' : 'text-red-700'}`}>
          {isMatch ? 'Validated product type' : 'Not validated product type'}: {detectedType}
        </p>
      </div>
    </div>
  )
}
