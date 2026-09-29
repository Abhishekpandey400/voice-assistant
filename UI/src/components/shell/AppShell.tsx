import { LogOut, Mic } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth/AuthContext'
import { Badge, roleTone } from '@/components/ui/badge'

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-white">
        <Mic className="size-4" />
      </span>
      <span className="text-lg font-semibold tracking-tight">
        Minute<span className="text-brand-600">Hire</span>
      </span>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">{user.fullName}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Badge tone={roleTone(user.role)}>{user.role}</Badge>
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="size-5" />
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
