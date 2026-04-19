import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/organisms/Navbar'
import { SKUResultsPanel } from '@/components/organisms/SKUResultsPanel'
import { SKUResultsSkeleton } from '@/components/organisms/SKUResultsSkeleton'
import { ResultsTabs } from '@/components/organisms/ResultsTabs'
import { analyzeByIdentifier } from '@/services/analysis'
import type { CombinedAnalysisResult } from '@/types/analysis'

export function SKUResults() {
  const { identifier } = useParams<{ identifier: string }>()
  const navigate = useNavigate()

  const [result, setResult] = useState<CombinedAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!identifier) return
    setIsLoading(true)
    setError(null)
    analyzeByIdentifier(identifier)
      .then(setResult)
      .catch(err => setError(err instanceof Error ? err.message : 'Analysis failed'))
      .finally(() => setIsLoading(false))
  }, [identifier])

  const refId = useMemo(() => {
    if (!result) return ''
    const ts = Date.now().toString(36).toUpperCase()
    return `${result.item_number.slice(0, 6).toUpperCase()}-${ts}`
  }, [result])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          Workflow: SKU Analysis Results
        </p>
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#004990]">Validation Report</h1>
          {identifier && (
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {identifier}
            </span>
          )}
        </div>

        {isLoading && <SKUResultsSkeleton />}

        {error && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="text-[#C32032] text-sm">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="text-xs text-[#004990] underline"
            >
              Back to search
            </button>
          </div>
        )}

        {result && !isLoading && (
          <div className="grid grid-cols-5 gap-8 items-start">
            <div className="col-span-2">
              <SKUResultsPanel
                result={result}
                refId={refId}
                onSearchNew={() => navigate('/')}
              />
            </div>
            <div className="col-span-3">
              <ResultsTabs clipResult={result.clip} aiResult={result.ai} />
            </div>
          </div>
        )}
      </main>

      {result && (
        <div className="max-w-7xl w-full mx-auto px-8 py-2 flex items-center gap-3">
          <span className="text-[10px] text-gray-400">
            Model: <span className="font-semibold text-gray-500">{result.clip.model_used}</span>
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-[10px] text-gray-400">
            Processing: <span className="font-semibold text-gray-500">{result.clip.processing_time_ms.toFixed(0)} ms</span>
          </span>
        </div>
      )}
    </div>
  )
}
