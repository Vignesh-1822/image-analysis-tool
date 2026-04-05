import { useState } from 'react'
import { Home } from '@/pages/Home'
import { Results } from '@/pages/Results'
import { analyzeWithClip, parseDescription } from '@/services/analysis'
import type { CLIPAnalysisResult, ParsedDescription } from '@/types/analysis'

type Page = 'home' | 'results'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [result, setResult] = useState<CLIPAnalysisResult | null>(null)
  const [parsed, setParsed] = useState<ParsedDescription | null>(null)

  const handleAnalyze = async (selectedFile: File, desc: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const [res, parsedDesc] = await Promise.all([
        analyzeWithClip(selectedFile, desc),
        parseDescription(desc),
      ])
      setFile(selectedFile)
      setDescription(desc)
      setResult(res)
      setParsed(parsedDesc)
      setPage('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadNew = () => {
    setFile(null)
    setDescription('')
    setResult(null)
    setParsed(null)
    setError(null)
    setPage('home')
  }

  const handleReAnalyze = async () => {
    if (!file || !description) return
    await handleAnalyze(file, description)
  }

  if (page === 'results' && result && file) {
    return (
      <Results
        file={file}
        description={description}
        parsed={parsed}
        result={result}
        onUploadNew={handleUploadNew}
        onReAnalyze={handleReAnalyze}
      />
    )
  }

  return (
    <Home
      isLoading={isLoading}
      error={error}
      onAnalyze={handleAnalyze}
    />
  )
}
