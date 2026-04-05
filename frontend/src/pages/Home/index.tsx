import { useState } from 'react'
import { Navbar } from '@/components/organisms/Navbar'
import { AnalysisLayout } from '@/components/organisms/AnalysisLayout'

export function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [modelName, setModelName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = () => {
    console.log('Analyze:', { file, modelName, description })
    setIsLoading(true)
    // API wiring comes next
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AnalysisLayout
        file={file}
        modelName={modelName}
        description={description}
        isLoading={isLoading}
        onFileSelect={setFile}
        onFileRemove={() => setFile(null)}
        onModelNameChange={setModelName}
        onDescriptionChange={setDescription}
        onAnalyze={handleAnalyze}
      />
    </div>
  )
}
