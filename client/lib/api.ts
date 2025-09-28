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

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? getToken() : null
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init?.headers as any || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(input, {
    headers,
    credentials: "include",
    ...init,
  })
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try {
      const data = await res.json()
      if (data?.error) msg = data.error
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}
