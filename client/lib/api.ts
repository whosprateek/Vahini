// Resolve API base URL safely. If NEXT_PUBLIC_API_BASE_URL is missing or malformed, fall back to localhost.
const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
const API_BASE = (() => {
  if (typeof RAW_BASE === 'string' && /^https?:\/\//i.test(RAW_BASE)) {
    return RAW_BASE.replace(/\/$/, '')
  }
  // If someone set it to ':4000/api' or similar invalid value, ignore and use default
  return "http://localhost:4000/api"
})()
export const API_BASE_URL = API_BASE
import { getToken } from '@/lib/auth-token'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? getToken() : null
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init?.headers as any || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const method = (init?.method || 'GET').toString().toUpperCase()
  const tryCount = method === 'GET' || method === 'HEAD' ? 3 : 1
  const backoffs = [250, 750, 1500]

  let lastErr: any = null
  for (let attempt = 0; attempt < tryCount; attempt++) {
    try {
      const res = await fetch(input, {
        headers,
        credentials: "include",
        ...init,
        // Ensure CORS mode in browsers
        mode: typeof window !== 'undefined' ? 'cors' : (init as any)?.mode,
      } as RequestInit)

      if (res.ok) {
        return res.json()
      }

      // Retry on transient gateway errors for idempotent requests
      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < tryCount - 1) {
        await sleep(backoffs[attempt] || 1000)
        continue
      }

      let msg = `${res.status} ${res.statusText}`
      try {
        const data = await res.json()
        if ((data as any)?.error) msg = (data as any).error
      } catch {}
      throw new Error(msg)
    } catch (e) {
      lastErr = e
      // Network error (no response) — retry idempotent requests
      if (attempt < tryCount - 1) {
        await sleep(backoffs[attempt] || 1000)
        continue
      }
      throw e
    }
  }
  throw lastErr ?? new Error('Request failed')
}
