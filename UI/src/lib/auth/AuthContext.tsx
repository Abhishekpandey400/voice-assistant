import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { api, loadSession, saveSession } from '@/lib/api'
import type { LoginResponse, UserProfile } from '@/lib/api/types'

interface AuthState {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<UserProfile>
  logout: () => void
  can: (permission: string) => boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => loadSession()?.user ?? null)

  const login = useCallback(async (email: string, password: string) => {
    const session = await api<LoginResponse>('/auth/login', { method: 'POST', json: { email, password } })
    saveSession(session)
    setUser(session.user)
    return session.user
  }, [])

  const logout = useCallback(() => {
    saveSession(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({ user, login, logout, can: (permission) => user?.permissions.includes(permission) ?? false }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

export const homePathFor = (user: UserProfile) => (user.role === 'Admin' ? '/admin' : '/assistant')
