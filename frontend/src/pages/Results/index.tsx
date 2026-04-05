import { Navbar } from '@/components/organisms/Navbar'
import { ResultsImagePanel } from '@/components/organisms/ResultsImagePanel'
import { ResultsTabs } from '@/components/organisms/ResultsTabs'
import { VerdictBanner } from '@/components/molecules/VerdictBanner'
import type { CLIPAnalysisResult, ParsedDescription } from '@/types/analysis'

interface ResultsProps {
  file: File
  description: string
  parsed: ParsedDescription | null
  result: CLIPAnalysisResult
  onUploadNew: () => void
  onReAnalyze: () => void
}

function generateRefId(file: File): string {
  const ts = Date.now().toString(36).toUpperCase()
  const name = file.name.replace(/\.[^.]+$/, '').slice(0, 4).toUpperCase()
  return `${name}-${ts}`
}

export function Results({ file, description, parsed, result, onUploadNew, onReAnalyze }: ResultsProps) {
  const refId = generateRefId(file)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Page header */}
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Workflow: Analysis Results
        </p>
        <h1 className="text-3xl font-bold text-[#004990] mb-1">Validation Report</h1>
        <p className="text-sm text-gray-500 mb-8 max-w-xl leading-relaxed">
          AI-generated audit results for the uploaded roofing product image.
        </p>

        <div className="grid grid-cols-5 gap-10 items-start">
          {/* Left: image panel */}
          <div className="col-span-2">
            <ResultsImagePanel
              file={file}
              description={description}
              parsed={parsed}
              refId={refId}
              verdict={result.verdict}
              onUploadNew={onUploadNew}
              onReAnalyze={onReAnalyze}
            />
          </div>

          {/* Right: tabs */}
          <div className="col-span-3 flex flex-col gap-4">
            <ResultsTabs clipResult={result} />
          </div>
        </div>
      </main>

      {/* Verdict banner — fixed to bottom */}
      <div className="sticky bottom-0">
        <VerdictBanner verdict={result.verdict} verdictReason={result.verdict_reason} />
      </div>
    </div>
  )
}
