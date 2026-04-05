import { useEffect, useState } from 'react'
import { RefIdBadge } from '@/components/atoms/RefIdBadge'
import { ProductDescriptionCard } from '@/components/molecules/ProductDescriptionCard'
import { Button } from '@/components/ui/button'
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
      {/* Image with overlay */}
      <div className="relative border border-gray-200 bg-gray-100">
        {previewUrl && (
          <img
            src={previewUrl}
            alt={file.name}
            className="w-full object-cover max-h-64"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
          <RefIdBadge refId={refId} valid={isValid} />
        </div>
      </div>

      <ProductDescriptionCard description={description} parsed={parsed} />

      <div className="flex gap-2">
        <Button
          onClick={onUploadNew}
          variant="outline"
          className="flex-1 rounded-none text-xs h-9 border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Upload New
        </Button>
        <Button
          onClick={onReAnalyze}
          className="flex-1 rounded-none text-xs h-9 bg-[#004990] hover:bg-[#003a7a] text-white"
        >
          Re-Analyze
        </Button>
      </div>
    </div>
  )
}
