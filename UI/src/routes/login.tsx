import { GraduationCap, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { warmUpApi } from '@/lib/api'
import { homePathFor, useAuth } from '@/lib/auth/AuthContext'
import { Logo } from '@/components/shell/AppShell'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { inputClass } from '@/components/ui/input'

const DEMO_ACCOUNTS = [
  { role: 'Student', email: 'student@minutehire.demo', password: 'Student@2026', icon: UserRound, hint: 'AI study buddy by voice' },
  { role: 'Teacher', email: 'teacher@minutehire.demo', password: 'Teacher@2026', icon: GraduationCap, hint: 'AI teaching assistant by voice' },
  { role: 'Admin', email: 'admin@minutehire.demo', password: 'Admin@2026', icon: ShieldCheck, hint: 'Dashboard, logs and users' },
]

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (!user) warmUpApi()
  }, [user])

  if (user) return <Navigate to={homePathFor(user)} replace />

  const submit = async (event?: FormEvent, credentials = { email, password }) => {
    event?.preventDefault()
    setBusy(true)
    setError(null)
    const slowTimer = window.setTimeout(() => setSlow(true), 3000)
    try {
      const profile = await login(credentials.email, credentials.password)
      navigate(homePathFor(profile), { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      window.clearTimeout(slowTimer)
      setSlow(false)
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="relative flex items-center gap-2 text-lg font-semibold">MinuteHire</div>
        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">Talk to your AI learning assistant.</h1>
          <p className="mt-4 text-brand-100">
            Students get a patient study buddy, teachers get a practical teaching assistant, and admins see every interaction in one place.
          </p>
        </div>
        <p className="relative text-sm text-brand-100">Voice input → AI processing → spoken response</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h2 className="mt-8 text-2xl font-semibold tracking-tight lg:mt-0">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use your account or pick a demo role below.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {error && <Alert onClose={() => setError(null)}>{error}</Alert>}
            {slow && (
              <p role="status" className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
                Waking up the server. The first sign-in after a quiet period can take up to a minute.
              </p>
            )}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
              <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
              <input
                className={inputClass}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <Button type="submit" busy={busy} className="w-full py-2.5">
              Sign in
            </Button>
          </form>

          <div className="mt-10">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Demo accounts</p>
            <div className="mt-3 grid gap-2">
              {DEMO_ACCOUNTS.map(({ role, email: demoEmail, password: demoPassword, icon: Icon, hint }) => (
                <button
                  key={role}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEmail(demoEmail)
                    setPassword(demoPassword)
                    submit(undefined, { email: demoEmail, password: demoPassword })
                  }}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md disabled:opacity-60"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
                    <Icon className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">Continue as {role}</span>
                    <span className="block text-xs text-slate-500">{hint}</span>
                  </span>
                  <span className="hidden font-mono text-xs text-slate-400 sm:block">{demoEmail}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
