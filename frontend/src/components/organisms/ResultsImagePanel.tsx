import { useEffect, useState } from 'react'
import { ProductDescriptionCard } from '@/components/molecules/ProductDescriptionCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ParsedDescription } from '@/types/analysis'

interface ResultsImagePanelProps {
  file: File
  description: string
  parsed: ParsedDescription | null
  refId: string
  verdict: string
  onUploadNew: () => void
  onReAnalyze: () => void
}

export function ResultsImagePanel({
  file,
  description,
  parsed,
  refId,
  verdict,
  onUploadNew,
  onReAnalyze,
}: ResultsImagePanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const isValid = verdict === 'Approved'

  return (
    <div className="flex flex-col gap-4">
      {/* Image card with overlay badges */}
      <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100">
        {previewUrl && (
          <img
            src={previewUrl}
            alt={file.name}
            className="w-full object-cover max-h-72"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4 flex items-end justify-between">
          {/* Left: REF ID */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-0.5">Ref ID</p>
            <p className="text-xs font-mono font-bold text-white">{refId}</p>
          </div>
          {/* Right: status badge */}
          <span
            className={cn(
              'text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm',
              isValid ? 'bg-emerald-500 text-white' : 'bg-[#C32032] text-white'
            )}
          >
            {isValid ? 'Source Image' : 'Invalid Input'}
          </span>
        </div>
      </div>

      <ProductDescriptionCard description={description} parsed={parsed} />

      <div className="flex gap-2">
        <Button
          onClick={onUploadNew}
          variant="outline"
          className="flex-1 rounded-xl text-xs h-9 border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Upload New
        </Button>
        <Button
          onClick={onReAnalyze}
          className="flex-1 rounded-xl text-xs h-9 bg-[#004990] hover:bg-[#003a7a] text-white"
        >
          Re-Analyze
        </Button>
      </div>
    </div>
  )
}
