import { useMemo } from 'react'
import { Navbar } from '@/components/organisms/Navbar'
import { ResultsImagePanel } from '@/components/organisms/ResultsImagePanel'
import { ResultsTabs } from '@/components/organisms/ResultsTabs'
import type { CLIPAnalysisResult, ParsedDescription } from '@/types/analysis'

interface ResultsProps {
  file: File
  description: string
  parsed: ParsedDescription | null
  result: CLIPAnalysisResult
  onUploadNew: () => void
  onReAnalyze: () => void
}

export function Results({ file, description, parsed, result, onUploadNew, onReAnalyze }: ResultsProps) {
  // Stable ref ID — only computed once per file
  const refId = useMemo(() => {
    const ts = Date.now().toString(36).toUpperCase()
    const name = file.name.replace(/\.[^.]+$/, '').slice(0, 4).toUpperCase()
    return `${name}-${ts}`
  }, [file])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10">
        {/* Page header */}
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          Workflow: Analysis Results
        </p>
        <h1 className="text-3xl font-bold text-[#004990] mb-1">Validation Report</h1>

        <div className="grid grid-cols-5 gap-8 items-start">
          {/* Left: image + description + buttons */}
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

          {/* Right: analysis tabs */}
          <div className="col-span-3">
            <ResultsTabs clipResult={result} />
          </div>
        </div>
      </main>

      {/* Model metadata */}
      <div className="max-w-7xl w-full mx-auto px-8 py-2 flex items-center gap-3">
        <span className="text-[10px] text-gray-400">
          Model: <span className="font-semibold text-gray-500">{result.model_used}</span>
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-[10px] text-gray-400">
          Processing: <span className="font-semibold text-gray-500">{result.processing_time_ms.toFixed(0)} ms</span>
        </span>
      </div>

    </div>
  )
}
