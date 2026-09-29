import { AlertTriangle, ArrowRight, Gauge, MessagesSquare, Mic, RefreshCw, Users } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Alert } from '@/components/ui/alert'
import { Badge, roleTone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { formatDay, formatMs } from '@/lib/utils'
import type { Dashboard } from '@/lib/api/types'

const SERIES = [
  { role: 'Student', color: 'var(--color-student)' },
  { role: 'Teacher', color: 'var(--color-teacher)' },
] as const

function StatTile({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-slate-500">
        <p className="text-sm font-medium">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  )
}

function TrendChart({ days }: { days: Dashboard['lastSevenDays'] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const totals = days.map((day) => day.interactions.reduce((sum, item) => sum + item.count, 0))
  const max = Math.max(4, ...totals)

  return (
    <div>
      <div className="flex items-center gap-4 text-xs text-slate-600" aria-hidden>
        {SERIES.map((series) => (
          <span key={series.role} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: series.color }} />
            {series.role}
          </span>
        ))}
      </div>
      <div className="relative mt-4 flex h-52 items-end gap-3 border-b border-slate-200" role="img" aria-label="Interactions per day over the last seven days by role">
        {[0.25, 0.5, 0.75, 1].map((fraction) => (
          <div key={fraction} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-100" style={{ bottom: `${fraction * 100}%` }} />
        ))}
        {days.map((day, index) => (
          <div
            key={day.date}
            className="relative flex h-full flex-1 flex-col items-center justify-end"
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            {totals[index] > 0 && <span className="mb-1 text-xs font-medium tabular-nums text-slate-600">{totals[index]}</span>}
            <div className="flex w-full max-w-10 flex-col-reverse gap-[2px]" style={{ height: `${(totals[index] / max) * 85}%` }}>
              {SERIES.map((series) => {
                const count = day.interactions.find((item) => item.role === series.role)?.count ?? 0
                return count > 0 ? (
                  <div
                    key={series.role}
                    className="w-full last:rounded-t-[4px]"
                    style={{ flexGrow: count, background: series.color, opacity: hovered === null || hovered === index ? 1 : 0.45 }}
                  />
                ) : null
              })}
            </div>
            {hovered === index && (
              <div className="absolute bottom-full z-10 mb-2 w-36 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
                <p className="font-medium">{formatDay(day.date)}</p>
                {SERIES.map((series) => (
                  <p key={series.role} className="mt-1 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-sm" style={{ background: series.color }} />
                      {series.role}
                    </span>
                    <span className="tabular-nums">{day.interactions.find((item) => item.role === series.role)?.count ?? 0}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {days.map((day) => (
          <span key={day.date} className="flex-1 text-center text-xs text-slate-500">
            {formatDay(day.date)}
          </span>
        ))}
      </div>
    </div>
  )
}

export function OverviewPanel({ onViewLogs }: { onViewLogs: () => void }) {
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await api<Dashboard>('/admin/dashboard'))
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 30000)
    return () => window.clearInterval(timer)
  }, [load])

  if (!data) return error ? <Alert>{error}</Alert> : <Spinner label="Loading dashboard…" />

  const voiceShare = data.totalInteractions ? Math.round((data.voiceInteractions / data.totalInteractions) * 100) : 0

  return (
    <div className="space-y-6">
      {error && <Alert onClose={() => setError(null)}>{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="AI interactions"
          value={data.totalInteractions}
          hint={`${data.interactionsToday} today · ${data.totalConversations} conversations`}
          icon={<MessagesSquare className="size-5" />}
        />
        <StatTile label="Voice share" value={`${voiceShare}%`} hint={`${data.voiceInteractions} spoken requests`} icon={<Mic className="size-5" />} />
        <StatTile label="Average AI latency" value={formatMs(data.averageLatencyMs)} hint="Speech-to-text plus LLM" icon={<Gauge className="size-5" />} />
        <StatTile
          label="Failed interactions"
          value={data.failedInteractions}
          hint={data.failedInteractions ? 'Open logs to review errors' : 'No failures recorded'}
          icon={<AlertTriangle className="size-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Interactions, last 7 days</h2>
            <Button variant="ghost" onClick={load} busy={loading} aria-label="Refresh dashboard">
              {!loading && <RefreshCw className="size-4" />}
              Refresh
            </Button>
          </div>
          <div className="mt-4">
            <TrendChart days={data.lastSevenDays} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <Users className="size-4 text-slate-500" /> Users
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {data.activeUsers} of {data.totalUsers} accounts active
          </p>
          <ul className="mt-4 space-y-2">
            {data.usersByRole.map((item) => (
              <li key={item.role} className="flex items-center justify-between text-sm">
                <Badge tone={roleTone(item.role)}>{item.role}</Badge>
                <span className="tabular-nums text-slate-700">{item.count}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-sm font-semibold">Most active</h3>
          {data.topUsers.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No interactions yet.</p>
          ) : (
            <ol className="mt-2 space-y-2">
              {data.topUsers.map((item) => (
                <li key={item.userId} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{item.fullName}</span>
                  <span className="flex items-center gap-2">
                    <Badge tone={roleTone(item.role)}>{item.role}</Badge>
                    <span className="w-6 text-right tabular-nums text-slate-700">{item.interactions}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
          <Button variant="secondary" className="mt-6 w-full" onClick={onViewLogs}>
            View activity logs <ArrowRight className="size-4" />
          </Button>
        </Card>
      </div>
    </div>
  )
}
