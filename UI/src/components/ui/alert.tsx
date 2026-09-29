import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Alert({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <span className="flex-1">{children}</span>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" className="text-rose-500 hover:text-rose-700">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
