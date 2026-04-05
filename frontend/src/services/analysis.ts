import type { CLIPAnalysisResult, ParsedDescription } from '@/types/analysis'

const BASE_URL = 'http://localhost:8000'

export async function analyzeWithClip(
  file: File,
  description: string
): Promise<CLIPAnalysisResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('description', description)

  const res = await fetch(`${BASE_URL}/api/analyze/clip`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<CLIPAnalysisResult>
}

export async function parseDescription(description: string): Promise<ParsedDescription> {
  const res = await fetch(`${BASE_URL}/api/parse-description`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<ParsedDescription>
}
