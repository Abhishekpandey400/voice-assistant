import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { Reveal } from '@/components/Reveal'

const QUOTE = 'Hirely has redefined the way I manage recruitment, employee engagement, and HR workflows.'

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  )
}

export function Testimonial() {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = QUOTE.split(' ')

  return (
    <section id="company" className="relative overflow-hidden py-28 sm:py-36">
      <img src="/assets/quote-bg.webp" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      <div className="container-x relative flex flex-col items-center text-center">
        <Reveal>
          <img src="/assets/quote.svg" alt="" className="h-[42px] w-auto" />
        </Reveal>
        <p ref={ref} className="mt-8 max-w-[760px] text-[26px] font-medium leading-[1.25] tracking-[-0.03em] sm:text-[36px]">
          {words.map((word, index) => (
            <Word key={index} word={word} progress={scrollYProgress} range={[index / words.length, (index + 1) / words.length]} />
          ))}
        </p>
        <Reveal delay={0.1} className="mt-14 flex items-center gap-7">
          <img src="/assets/brand-attracts.svg" alt="attracts" className="h-6 w-auto" />
          <span className="h-11 w-px bg-ink/10" />
          <div className="text-left">
            <p className="text-[16px] font-medium">Leo Geidt</p>
            <p className="text-[16px] text-body">Founder</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
