const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000'

export async function login(password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })

  if (res.status === 429) throw new Error('Too many attempts. Please wait a minute.')
  if (!res.ok) throw new Error('Incorrect password.')

  const data = (await res.json()) as { access_token: string }
  return data.access_token
}
