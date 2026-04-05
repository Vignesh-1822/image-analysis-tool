import { UploadZone } from '@/components/atoms/UploadZone'
import { ProductSpecsForm } from '@/components/molecules/ProductSpecsForm'
import { StatsRow } from '@/components/molecules/StatsRow'

interface AnalysisLayoutProps {
  file: File | null
  description: string
  isLoading: boolean
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  onDescriptionChange: (val: string) => void
  onAnalyze: () => void
}

const PROTOCOL_ITEMS = [
  'Granular loss detection',
  'Pattern uniformity scoring',
  'Edge sealant verification',
]

export function AnalysisLayout({
  file,
  description,
  isLoading,
  onFileSelect,
  onFileRemove,
  onDescriptionChange,
  onAnalyze,
}: AnalysisLayoutProps) {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* Page header */}
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Workflow: Setup Analysis
        </p>
        <h1 className="text-3xl font-bold text-[#004990] mb-1">Precision Product Audit</h1>
        <p className="text-sm text-gray-500 mb-8 max-w-xl leading-relaxed">
          Upload high-resolution roofing product images for clinical-grade AI validation
          against manufacturer specifications.
        </p>

        {/* Two-column grid — no card wrappers, content sits on white page */}
        <div className="grid grid-cols-5 gap-12 items-start">

          {/* Left: upload + stats */}
          <div className="col-span-3">
            <UploadZone file={file} onFileSelect={onFileSelect} onRemove={onFileRemove} />
            <StatsRow />
          </div>

          {/* Right: form + protocol — no card, just content */}
          <div className="col-span-2 flex flex-col gap-8">
            <ProductSpecsForm
              description={description}
              onDescriptionChange={onDescriptionChange}
              onAnalyze={onAnalyze}
              isLoading={isLoading}
            />

            {/* Analysis Protocol — plain section, no card */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Analysis Protocol
              </p>
              <ul className="flex flex-col gap-2">
                {PROTOCOL_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-[#C32032] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
