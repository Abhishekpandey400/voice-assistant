import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

const variants = {
  dark: 'bg-ink text-white shadow-[0_6px_16px_-6px_rgba(28,32,53,0.55)] hover:bg-[#2b3050]',
  lime: 'bg-lime text-ink shadow-[0_8px_20px_-8px_rgba(120,220,80,0.9)] hover:bg-[#b5ff92]',
  white: 'bg-white text-ink shadow-[0_6px_20px_-6px_rgba(28,32,53,0.18)] ring-1 ring-black/5 hover:bg-mist',
  mist: 'bg-mist text-ink hover:bg-[#e9e9f0]',
}

interface ButtonProps {
  children: ReactNode
  variant?: keyof typeof variants
  arrow?: boolean
  href?: string
  className?: string
}

export function Button({ children, variant = 'dark', arrow, href = '#', className = '' }: ButtonProps) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[17px] font-medium tracking-[-0.02em] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${variants[variant]} ${className}`}
    >
      {children}
      {arrow && <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />}
    </a>
  )
}
