import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Keyboard, Mic, RefreshCw, Search, X, XCircle } from 'lucide-react'
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

type Option = { value: string; label: string }

const ROLE_OPTIONS: Option[] = [
  { value: '', label: 'All roles' },
  ...['Student', 'Teacher', 'Admin'].map((role) => ({ value: role, label: role })),
]
const ACTION_OPTIONS: Option[] = [{ value: '', label: 'All actions' }, ...ACTIONS.map((action) => ({ value: action, label: splitWords(action) }))]
const MODE_OPTIONS: Option[] = [
  { value: '', label: 'Voice and text' },
  { value: 'Voice', label: 'Voice only' },
  { value: 'Text', label: 'Text only' },
]
const OUTCOME_OPTIONS: Option[] = [
  { value: '', label: 'Any outcome' },
  { value: 'true', label: 'Success' },
  { value: 'false', label: 'Failed' },
]

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

const filterControl =
  'h-10 w-full rounded-lg border bg-white px-3 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  )
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  return (
    <FilterField label={label}>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${filterControl} appearance-none pr-9 ${value ? 'border-brand-500 bg-brand-50/50 font-medium text-brand-700' : 'border-slate-300 text-slate-700'}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </span>
    </FilterField>
  )
}

function FilterDate({ label, value, min, max, onChange }: { label: string; value: string; min?: string; max?: string; onChange: (value: string) => void }) {
  return (
    <FilterField label={label}>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className={`${filterControl} ${value ? 'border-brand-500 bg-brand-50/50 text-brand-700' : 'border-slate-300 text-slate-700'}`}
      />
    </FilterField>
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

  const activeFilters = Object.values(filters).filter(Boolean).length

  const clearFilters = () => {
    setSearch('')
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  return (
    <Card className="overflow-hidden">
      <div className="space-y-4 border-b border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className={`${inputClass} h-10 pl-9 pr-9`}
              placeholder="Search by user email, request or response"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilters > 0 && (
              <Button variant="ghost" onClick={clearFilters} className="h-10">
                <X className="size-4" />
                Clear filters
                <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{activeFilters}</span>
              </Button>
            )}
            <Button variant="secondary" onClick={load} busy={loading} className="h-10">
              {!loading && <RefreshCw className="size-4" />}
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <FilterSelect label="Role" value={filters.role} options={ROLE_OPTIONS} onChange={(value) => setFilter('role', value)} />
          <FilterSelect label="Action" value={filters.action} options={ACTION_OPTIONS} onChange={(value) => setFilter('action', value)} />
          <FilterSelect label="Input mode" value={filters.inputMode} options={MODE_OPTIONS} onChange={(value) => setFilter('inputMode', value)} />
          <FilterSelect label="Outcome" value={filters.isSuccess} options={OUTCOME_OPTIONS} onChange={(value) => setFilter('isSuccess', value)} />
          <FilterDate label="From" value={filters.from} max={filters.to || undefined} onChange={(value) => setFilter('from', value)} />
          <FilterDate label="To" value={filters.to} min={filters.from || undefined} onChange={(value) => setFilter('to', value)} />
        </div>
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
