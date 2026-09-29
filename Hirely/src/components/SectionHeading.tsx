import type { ReactNode } from 'react'
import { Button } from '@/components/Button'
import { Reveal } from '@/components/Reveal'

interface SectionHeadingProps {
  label: string
  title: ReactNode
  description?: ReactNode
  cta?: string
}

export function SectionHeading({ label, title, description, cta = 'Try Hirely' }: SectionHeadingProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <Reveal>
        <p className="text-[17px] font-medium text-body">{label}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="heading mt-4 text-[40px] sm:text-[52px] lg:text-[60px]">{title}</h2>
      </Reveal>
      {description && (
        <Reveal delay={0.16}>
          <p className="mx-auto mt-5 max-w-[340px] text-[17px] leading-snug text-body">{description}</p>
        </Reveal>
      )}
      <Reveal delay={0.24} className="mt-8">
        <Button arrow>{cta}</Button>
      </Reveal>
    </div>
  )
}
