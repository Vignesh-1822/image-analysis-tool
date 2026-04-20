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
      <AnalysisLayout
        file={file}
        description={description}
        isLoading={isLoading}
        error={error}
        onFileSelect={setFile}
        onFileRemove={() => setFile(null)}
        onDescriptionChange={setDescription}
        onAnalyze={handleAnalyze}
      />
    </div>
  )
}
