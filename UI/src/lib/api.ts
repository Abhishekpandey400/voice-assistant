import type { LoginResponse } from '@/lib/api/types'

const SESSION_KEY = 'minutehire.session'
const API_HOST = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '')
const API_URL = API_HOST && !/^https?:\/\//.test(API_HOST) ? `https://${API_HOST}` : API_HOST

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
  }
}

export function loadSession(): LoginResponse | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as LoginResponse
    return new Date(session.expiresAt) > new Date() ? session : null
  } catch {
    return null
  }
}

export function saveSession(session: LoginResponse | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    return
  }
}

export function warmUpApi() {
  fetch(`${API_URL}/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => undefined)
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  json?: unknown
  form?: FormData
  query?: Record<string, string | number | boolean | undefined | null>
}

export async function api<T>(path: string, { method = 'GET', json, form, query }: RequestOptions = {}): Promise<T> {
  const session = loadSession()
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (session) headers.Authorization = `Bearer ${session.accessToken}`
  if (json !== undefined) headers['Content-Type'] = 'application/json'

  const search = new URLSearchParams()
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  })
  const url = `${API_URL}/api${path}${search.size ? `?${search}` : ''}`

  let response: Response
  try {
    response = await fetch(url, { method, headers, body: form ?? (json !== undefined ? JSON.stringify(json) : undefined) })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }

  if (response.status === 401 && session) {
    saveSession(null)
    window.location.assign('/login')
  }

  if (!response.ok) throw new ApiError(response.status, await problemMessage(response))

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}

async function problemMessage(response: Response): Promise<string> {
  try {
    const problem = await response.json()
    const validation = problem.errors ? Object.values(problem.errors as Record<string, string[]>).flat()[0] : null
    return validation ?? problem.detail ?? problem.title ?? response.statusText
  } catch {
    return response.statusText || 'Request failed.'
  }
}
