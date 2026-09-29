import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Reveal } from '@/components/Reveal'

const FEATURES = [
  {
    title: 'Seamless workflows with Hirely',
    text: 'Seamless Integration Across All HR Processes From recruitment to employee engagement, Hirely integrates all your HR processes into one platform.',
    image: '/assets/feature-1.webp',
  },
  {
    title: 'Unified HR Operations, Simplified',
    text: 'Manage hiring, onboarding, payroll, and performance in one streamlined platform.',
    image: '/assets/feature-2.webp',
  },
  {
    title: 'Modern HR, Built for Growing Teams',
    text: 'Scale your people operations with flexible tools designed to adapt as your company grows.',
    image: '/assets/feature-3.webp',
  },
]

export function KeyFeatures() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (value) =>
    setActive(Math.min(FEATURES.length - 1, Math.floor(value * FEATURES.length))),
  )

  const select = (index: number) => {
    const track = trackRef.current
    if (!track || window.innerWidth < 1024) return setActive(index)
    const top = track.offsetTop + ((track.offsetHeight - window.innerHeight) * (index + 0.5)) / FEATURES.length
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <section id="features" ref={trackRef} className="relative lg:h-[300vh]">
      <div className="container-x grid items-center gap-12 py-20 lg:sticky lg:top-0 lg:h-screen lg:grid-cols-2 lg:gap-16 lg:py-0">
        <div>
          <Reveal>
            <p className="text-[17px] font-medium text-body">Key Features</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="heading mt-4 text-[40px] sm:text-[52px] lg:text-[60px]">Hirely to match your HR and payroll needs.</h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-[17px] text-body">Concepts to fit your HR management app</p>
          </Reveal>
          <Reveal delay={0.24} className="mt-8">
            <Button arrow>Try Hirely</Button>
          </Reveal>

          <ul className="mt-12 space-y-3">
            {FEATURES.map((feature, index) => {
              const isActive = index === active
              return (
                <li key={feature.title}>
                  <button
                    onClick={() => select(index)}
                    className={`relative w-full overflow-hidden rounded-3xl px-6 py-5 text-left transition-colors duration-500 ${isActive ? 'bg-panel' : 'hover:bg-panel/60'}`}
                  >
                    {isActive && (
                      <motion.span layoutId="feature-progress" className="absolute left-0 top-5 bottom-5 w-1 rounded-full bg-lime" />
                    )}
                    <span className={`block text-[19px] font-medium tracking-[-0.03em] transition-colors ${isActive ? 'text-ink' : 'text-ink/80'}`}>
                      {feature.title}
                    </span>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.span
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="block overflow-hidden"
                        >
                          <span className="block max-w-[360px] pt-3 text-[17px] leading-snug text-body">{feature.text}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <Reveal className="relative grid aspect-[615/620] place-items-center overflow-hidden rounded-[32px] bg-panel">
          <AnimatePresence mode="wait">
            <motion.img
              key={FEATURES[active].image}
              src={FEATURES[active].image}
              alt={FEATURES[active].title}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.98 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-[78%] w-auto max-w-[78%] object-contain drop-shadow-[0_24px_40px_rgba(28,32,53,0.12)]"
            />
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  )
}
