import { useMemo } from 'react'
import { Navbar } from '@/components/organisms/Navbar'
import { ResultsImagePanel } from '@/components/organisms/ResultsImagePanel'
import { ResultsTabs } from '@/components/organisms/ResultsTabs'
import type { AIModelAnalysisResult, CLIPAnalysisResult, ParsedDescription } from '@/types/analysis'

interface ResultsProps {
  file: File
  description: string
  parsed: ParsedDescription | null
  result: CLIPAnalysisResult
  aiResult: AIModelAnalysisResult | null
  onUploadNew: () => void
  onReAnalyze: () => void
}

export function Results({ file, description, parsed, result, aiResult, onUploadNew, onReAnalyze }: ResultsProps) {
  const refId = useMemo(() => {
    const ts = Date.now().toString(36).toUpperCase()
    const name = file.name.replace(/\.[^.]+$/, '').slice(0, 4).toUpperCase()
    return `${name}-${ts}`
  }, [file])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          Workflow: Analysis Results
        </p>
        <h1 className="text-3xl font-bold text-[#004990] mb-1">Validation Report</h1>

        <div className="grid grid-cols-5 gap-8 items-start">
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

          <div className="col-span-3">
            <ResultsTabs clipResult={result} aiResult={aiResult} />
          </div>
        </div>
      </main>
    </div>
  )
}
