import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Button } from '@/components/Button'

const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 32, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.9, delay, ease },
})

export function Hero() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: dashboardRef, offset: ['start end', 'center center'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [18, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1])
  const y = useTransform(scrollYProgress, [0, 1], [60, 0])

  return (
    <section className="relative overflow-hidden pt-[150px] sm:pt-[200px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] sm:h-[808px]">
        <img src="/assets/hero-bg.webp" alt="" className="animate-drift h-full w-full object-cover opacity-90" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
      </div>

      <div className="container-x relative flex flex-col items-center text-center">
        <motion.p
          {...fadeUp(0.1)}
          className="rounded-lg bg-white px-3 py-1.5 text-[15px] font-medium tracking-[-0.02em] shadow-[0_4px_14px_-4px_rgba(28,32,53,0.12)] ring-1 ring-black/[0.03]"
        >
          Simple and integrated HR tools
        </motion.p>

        <motion.h1 {...fadeUp(0.2)} className="heading mt-7 text-[52px] leading-[1.05] sm:text-[72px] lg:text-[88px]">
          Hirely, Simple
          <br />
          and hassle-free
        </motion.h1>

        <motion.p {...fadeUp(0.35)} className="mt-8 max-w-[340px] text-[17px] leading-snug text-body">
          Simple payroll, integrated HR tools, and expert support, all in one place.
        </motion.p>

        <motion.div {...fadeUp(0.5)} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button variant="lime">Try Hirely for free</Button>
          <Button variant="white">Book a demo</Button>
        </motion.div>
      </div>

      <div ref={dashboardRef} className="container-x relative mt-16 [perspective:1600px] sm:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.6, ease }}
          style={{ rotateX, scale, y }}
          className="mx-auto max-w-[1064px] origin-top overflow-hidden rounded-[20px] bg-white shadow-[0_40px_80px_-30px_rgba(28,32,53,0.35),0_0_0_1px_rgba(28,32,53,0.04)] sm:rounded-[28px]"
        >
          <img src="/assets/dashboard.webp" alt="Hirely HR dashboard showing employees, attendance and enrollment statistics" className="block h-auto w-full" />
        </motion.div>
      </div>
    </section>
  )
}
