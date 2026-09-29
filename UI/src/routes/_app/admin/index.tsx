import { Activity, LayoutDashboard, Users } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Permissions } from '@/lib/api/types'
import { ActivityLogsPanel } from '@/routes/_app/admin/ActivityLogsPanel'
import { OverviewPanel } from '@/routes/_app/admin/OverviewPanel'
import { UsersPanel } from '@/routes/_app/admin/UsersPanel'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, permission: Permissions.DashboardView },
  { id: 'logs', label: 'Activity logs', icon: Activity, permission: Permissions.ActivityLogsRead },
  { id: 'users', label: 'Users', icon: Users, permission: Permissions.UsersManage },
] as const

type TabId = (typeof TABS)[number]['id']

export function AdminPage() {
  const { can } = useAuth()
  const [tab, setTab] = useState<TabId>('overview')
  const tabs = TABS.filter((item) => can(item.permission))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor Student and Teacher interactions with the AI assistant.</p>
        </div>
        <nav className="flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'overview' && <OverviewPanel onViewLogs={() => setTab('logs')} />}
      {tab === 'logs' && <ActivityLogsPanel />}
      {tab === 'users' && <UsersPanel />}
    </div>
  )
}
