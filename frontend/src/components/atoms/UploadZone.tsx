import { useRef, useState, useEffect } from 'react'
import { CloudUpload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  onRemove: () => void
  file: File | null
}

export function UploadZone({ onFileSelect, onRemove, file }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFileSelect(dropped)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFileSelect(f)
    e.target.value = '' // reset so same file can be re-selected after removal
  }

  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = ''
    onRemove()
  }

  // ── Preview state ──────────────────────────────────────────────────────────
  if (file && previewUrl) {
    return (
      <div className="border border-gray-200 bg-white">
        <img
          src={previewUrl}
          alt={file.name}
          className="w-full object-cover max-h-72"
        />

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-gray-50">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{file.name}</p>
            <p className="text-[10px] text-gray-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          <button
            onClick={handleRemove}
            className="flex items-center gap-1.5 text-xs text-[#C32032] hover:text-[#a81b2a] font-medium transition-colors ml-4 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>

        {/* hidden input so user can re-upload after removing */}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/tiff"
          onChange={handleFileInput}
        />
      </div>
    )
  }

  // ── Drop zone ──────────────────────────────────────────────────────────────
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'cursor-pointer border-2 border-dashed bg-white flex flex-col items-center justify-center gap-4 py-16 px-8 transition-colors duration-150',
        isDragOver ? 'border-[#004990] bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      )}
    >
      <CloudUpload className="w-10 h-10 text-gray-400" />

      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700">
          {isDragOver ? 'Release to upload' : 'Drop your roofing image here'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Supported formats: RAW, JPG, PNG</p>
      </div>

      <Button
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
        className="bg-[#004990] hover:bg-[#003a7a] text-white text-sm rounded-none px-6"
      >
        Select File...
      </Button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/tiff"
        onChange={handleFileInput}
      />
    </div>
  )
}
