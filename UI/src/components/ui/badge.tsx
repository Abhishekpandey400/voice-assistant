import type { ReactNode } from 'react'

const tones = {
  neutral: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-rose-50 text-rose-700',
  student: 'bg-blue-50 text-blue-700',
  teacher: 'bg-orange-50 text-orange-700',
  admin: 'bg-violet-50 text-violet-700',
}

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
}

export const roleTone = (role: string | null) =>
  role === 'Student' ? 'student' : role === 'Teacher' ? 'teacher' : role === 'Admin' ? 'admin' : 'neutral'
