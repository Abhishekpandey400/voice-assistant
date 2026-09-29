import { CheckCircle2, ChevronLeft, ChevronRight, Keyboard, Mic, RefreshCw, Search, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Transcript } from '@/components/data/Transcript'
import { Alert } from '@/components/ui/alert'
import { Badge, roleTone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Drawer } from '@/components/ui/drawer'
import { inputClass } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { formatDateTime, formatMs, splitWords } from '@/lib/utils'
import type { ActivityAction, ActivityLog, ConversationDetail, PagedResult } from '@/lib/api/types'

const ACTIONS: ActivityAction[] = ['AiInteraction', 'ConversationStarted', 'Login', 'LoginFailed', 'UserCreated', 'UserStatusChanged']

interface Filters {
  role: string
  action: string
  inputMode: string
  isSuccess: string
  search: string
  from: string
  to: string
}

const EMPTY_FILTERS: Filters = { role: '', action: '', inputMode: '', isSuccess: '', search: '', from: '', to: '' }
const PAGE_SIZE = 15

const toIso = (date: string, endOfDay: boolean) => (date ? new Date(`${date}T${endOfDay ? '23:59:59' : '00:00:00'}`).toISOString() : undefined)

function Select({ value, onChange, children, label }: { value: string; onChange: (value: string) => void; children: ReactNode; label: string }) {
  return (
    <select aria-label={label} className={`${inputClass} w-auto`} value={value} onChange={(event) => onChange(event.target.value)}>
      {children}
    </select>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">{children}</dd>
    </div>
  )
}

function LogDetail({ log, onOpenConversation }: { log: ActivityLog; onOpenConversation: (id: string) => void }) {
  return (
    <dl className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={log.isSuccess ? 'success' : 'danger'}>{log.isSuccess ? 'Success' : 'Failed'}</Badge>
        {log.role && <Badge tone={roleTone(log.role)}>{log.role}</Badge>}
        {log.inputMode && <Badge tone="brand">{log.inputMode}</Badge>}
      </div>
      <Field label="User">{log.userName ? `${log.userName} (${log.userEmail})` : (log.userEmail ?? 'Anonymous')}</Field>
      <Field label="Timestamp">{formatDateTime(log.createdAt)}</Field>
      {log.requestText && <Field label="Request">{log.requestText}</Field>}
      {log.responseText && <Field label="Response">{log.responseText}</Field>}
      {log.errorMessage && <Field label="Error">{log.errorMessage}</Field>}
      <div className="grid grid-cols-2 gap-5">
        <Field label="AI provider">{log.provider ?? '—'}</Field>
        <Field label="Model">{log.model ?? '—'}</Field>
        <Field label="Latency">{formatMs(log.latencyMs)}</Field>
        <Field label="IP address">{log.ipAddress ?? '—'}</Field>
      </div>
      {log.userAgent && <Field label="User agent">{log.userAgent}</Field>}
      {log.conversationId && (
        <Button variant="secondary" onClick={() => onOpenConversation(log.conversationId!)}>
          View full conversation
        </Button>
      )}
    </dl>
  )
}

export function ActivityLogsPanel() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PagedResult<ActivityLog> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ActivityLog | null>(null)
  const [conversation, setConversation] = useState<ConversationDetail | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(
        await api<PagedResult<ActivityLog>>('/admin/activity-logs', {
          query: {
            ...filters,
            from: toIso(filters.from, false),
            to: toIso(filters.to, true),
            page,
            pageSize: PAGE_SIZE,
          },
        }),
      )
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const timer = window.setTimeout(() => setFilter('search', search), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => (current[key] === value ? current : { ...current, [key]: value }))
    setPage(1)
  }

  const openConversation = async (id: string) => {
    try {
      setConversation(await api<ConversationDetail>(`/admin/conversations/${id}`))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-4">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Search user, request or response"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select label="Role" value={filters.role} onChange={(value) => setFilter('role', value)}>
          <option value="">All roles</option>
          <option>Student</option>
          <option>Teacher</option>
          <option>Admin</option>
        </Select>
        <Select label="Action" value={filters.action} onChange={(value) => setFilter('action', value)}>
          <option value="">All actions</option>
          {ACTIONS.map((action) => (
            <option key={action} value={action}>
              {splitWords(action)}
            </option>
          ))}
        </Select>
        <Select label="Input mode" value={filters.inputMode} onChange={(value) => setFilter('inputMode', value)}>
          <option value="">Voice and text</option>
          <option>Voice</option>
          <option>Text</option>
        </Select>
        <Select label="Outcome" value={filters.isSuccess} onChange={(value) => setFilter('isSuccess', value)}>
          <option value="">Any outcome</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </Select>
        <input aria-label="From date" type="date" className={`${inputClass} w-auto`} value={filters.from} onChange={(event) => setFilter('from', event.target.value)} />
        <input aria-label="To date" type="date" className={`${inputClass} w-auto`} value={filters.to} onChange={(event) => setFilter('to', event.target.value)} />
        <Button variant="ghost" onClick={load} busy={loading} aria-label="Refresh logs">
          {!loading && <RefreshCw className="size-4" />}
        </Button>
      </div>

      {error && (
        <div className="p-4">
          <Alert onClose={() => setError(null)}>{error}</Alert>
        </div>
      )}

      {!data ? (
        <Spinner label="Loading activity…" />
      ) : data.items.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">No activity matches these filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Request</th>
                <th className="px-4 py-3 font-medium">Latency</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((log) => (
                <tr key={log.id} onClick={() => setSelected(log)} className="cursor-pointer transition-colors hover:bg-brand-50/40">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{log.userName ?? log.userEmail ?? 'Anonymous'}</p>
                    {log.role && <Badge tone={roleTone(log.role)}>{log.role}</Badge>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      {log.inputMode === 'Voice' && <Mic className="size-3.5 text-slate-400" />}
                      {log.inputMode === 'Text' && <Keyboard className="size-3.5 text-slate-400" />}
                      {splitWords(log.action)}
                    </span>
                  </td>
                  <td className="max-w-sm px-4 py-3">
                    <p className="truncate text-slate-700">{log.requestText ?? log.errorMessage ?? '—'}</p>
                    {log.responseText && <p className="truncate text-xs text-slate-500">↳ {log.responseText}</p>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{formatMs(log.latencyMs)}</td>
                  <td className="px-4 py-3">
                    {log.isSuccess ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="size-4" /> OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700">
                        <XCircle className="size-4" /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalCount > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <span>
            {data.totalCount} entries · page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} aria-label="Previous page">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage((value) => value + 1)} aria-label="Next page">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {selected && !conversation && (
        <Drawer title={splitWords(selected.action)} onClose={() => setSelected(null)}>
          <LogDetail log={selected} onOpenConversation={openConversation} />
        </Drawer>
      )}
      {conversation && (
        <Drawer title={`${conversation.ownerName} · ${conversation.title}`} onClose={() => setConversation(null)}>
          <p className="mb-5 text-sm text-slate-500">
            {conversation.ownerRole} · started {formatDateTime(conversation.startedAt)} · {conversation.messages.length} messages
          </p>
          <Transcript messages={conversation.messages} assistantName="Assistant" />
        </Drawer>
      )}
    </Card>
  )
}
