import { useState } from 'react'
import { Navbar } from '@/components/organisms/Navbar'
import { AnalysisLayout } from '@/components/organisms/AnalysisLayout'

interface HomeProps {
  isLoading: boolean
  error: string | null
  onAnalyze: (file: File, description: string) => void
}

export function Home({ isLoading, error, onAnalyze }: HomeProps) {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')

  const handleAnalyze = () => {
    if (!file || !description.trim()) return
    onAnalyze(file, description)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {error && (
        <div className="max-w-7xl mx-auto px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        </div>
      )}
      <AnalysisLayout
        file={file}
        description={description}
        isLoading={isLoading}
        onFileSelect={setFile}
        onFileRemove={() => setFile(null)}
        onDescriptionChange={setDescription}
        onAnalyze={handleAnalyze}
      />
    </div>
  )
}
