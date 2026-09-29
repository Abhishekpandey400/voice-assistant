import { UserPlus } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Alert } from '@/components/ui/alert'
import { Badge, roleTone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { inputClass } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import type { ManagedUser, Role } from '@/lib/api/types'

const EMPTY_FORM = { fullName: '', email: '', password: '', role: 'Student' as Role }

export function UsersPanel() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<ManagedUser[] | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(() => api<ManagedUser[]>('/admin/users').then(setUsers), [])

  useEffect(() => {
    load().catch((err: Error) => setError(err.message))
  }, [load])

  const create = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const created = await api<ManagedUser>('/admin/users', { method: 'POST', json: form })
      setUsers((current) => [...(current ?? []), created])
      setForm(EMPTY_FORM)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (target: ManagedUser) => {
    setToggling(target.id)
    setError(null)
    try {
      const updated = await api<ManagedUser>(`/admin/users/${target.id}/status`, { method: 'PATCH', json: { isActive: !target.isActive } })
      setUsers((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="overflow-hidden">
        {!users ? (
          <Spinner label="Loading users…" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Last sign-in</th>
                  <th className="px-4 py-3 font-medium">Conversations</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.fullName}</p>
                      <p className="text-xs text-slate-500">{item.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={roleTone(item.role)}>{item.role}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.lastLoginAt ? formatDateTime(item.lastLoginAt) : 'Never'}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">{item.conversationCount}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant={item.isActive ? 'secondary' : 'primary'}
                        className="px-3 py-1 text-xs"
                        busy={toggling === item.id}
                        disabled={item.id === me?.id}
                        onClick={() => toggle(item)}
                        title={item.id === me?.id ? 'You cannot deactivate yourself' : undefined}
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="h-fit p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <UserPlus className="size-4 text-slate-500" /> Add a user
        </h2>
        <form onSubmit={create} className="mt-4 space-y-3">
          {error && <Alert onClose={() => setError(null)}>{error}</Alert>}
          <input className={inputClass} placeholder="Full name" required maxLength={120} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input className={inputClass} placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input
            className={inputClass}
            placeholder="Password (min 8 characters)"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select aria-label="Role" className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            <option>Student</option>
            <option>Teacher</option>
            <option>Admin</option>
          </select>
          <Button type="submit" busy={saving} className="w-full">
            Create user
          </Button>
        </form>
      </Card>
    </div>
  )
}
