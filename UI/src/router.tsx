import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { homePathFor, useAuth } from '@/lib/auth/AuthContext'
import { AppShell } from '@/components/shell/AppShell'
import { Permissions } from '@/lib/api/types'
import { AdminPage } from '@/routes/_app/admin'
import { AssistantPage } from '@/routes/_app/assistant'
import { LoginPage } from '@/routes/login'

function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { user, can } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!can(permission)) return <Navigate to={homePathFor(user)} replace />
  return <AppShell>{children}</AppShell>
}

function Home() {
  const { user } = useAuth()
  return <Navigate to={user ? homePathFor(user) : '/login'} replace />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/assistant"
        element={
          <RequirePermission permission={Permissions.AssistantUse}>
            <AssistantPage />
          </RequirePermission>
        }
      />
      <Route
        path="/admin"
        element={
          <RequirePermission permission={Permissions.DashboardView}>
            <AdminPage />
          </RequirePermission>
        }
      />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
