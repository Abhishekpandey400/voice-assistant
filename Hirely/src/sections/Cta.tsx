import { Button } from '@/components/Button'
import { Reveal } from '@/components/Reveal'

export function Cta() {
  return (
    <section id="contact" className="container-x py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-[32px] px-6 pb-20 pt-20 text-center sm:rounded-[40px] sm:pb-24 sm:pt-24">
        <img src="/assets/cta-bg.png" alt="" className="animate-drift pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom" />
        <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white to-transparent" />
        <div className="relative flex flex-col items-center">
          <Reveal>
            <p className="text-[15px] font-medium">Sign up</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="heading mt-5 max-w-[800px] text-[44px] sm:text-[64px] lg:text-[80px]">Start building a better workflow</h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-[330px] text-[17px] leading-snug">Simple payroll, integrated HR tools, and expert support, all in one place.</p>
          </Reveal>
          <Reveal delay={0.24} className="mt-9">
            <Button variant="white">Try Hirely for free</Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
