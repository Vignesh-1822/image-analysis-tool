import type { AIModelAnalysisResult, CLIPAnalysisResult, CombinedAnalysisResult, ParsedDescription } from '@/types/analysis'

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

export async function analyzeWithAI(
  file: File,
  description: string
): Promise<AIModelAnalysisResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('description', description)

  const res = await fetch(`${BASE_URL}/api/analyze/ai-model`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<AIModelAnalysisResult>
}

export async function analyzeByIdentifier(identifier: string, signal?: AbortSignal): Promise<CombinedAnalysisResult> {
  const res = await fetch(`${BASE_URL}/api/analyze/${encodeURIComponent(identifier)}`, {
    method: 'POST',
    signal,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<CombinedAnalysisResult>
}

export async function insertSku(
  lightData: Record<string, unknown>,
  fullData: Record<string, unknown>
): Promise<{ message: string; item_number: string; sku_id: string; primary_color: string; hierarchy: string; image_link: string }> {
  const res = await fetch(`${BASE_URL}/api/admin/insert-sku`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ light_data: lightData, full_data: fullData }),
  })

  const body = await res.json().catch(() => ({ detail: 'Unknown error' }))

  if (res.status === 409) {
    throw new Error(body.detail?.error ?? 'Product already exists')
  }
  if (!res.ok) {
    throw new Error(body.detail?.error ?? body.detail ?? `HTTP ${res.status}`)
  }

  return body
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
