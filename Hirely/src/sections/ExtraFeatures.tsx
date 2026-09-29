import type { ReactNode } from 'react'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'

const TILES = [
  { src: '/assets/int-1.svg', className: 'left-[16%] top-[14%]', delay: '0s' },
  { src: '/assets/int-2.svg', className: 'right-[16%] top-[14%]', delay: '0.8s' },
  { src: '/assets/int-3.svg', className: 'bottom-[14%] left-[16%]', delay: '1.6s' },
  { src: '/assets/int-4.svg', className: 'bottom-[14%] right-[16%]', delay: '2.4s' },
]

function FeatureCard({ tag, title, text, children, delay }: { tag: string; title: string; text: string; children: ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay} className="group">
      <div className="relative grid aspect-[630/400] place-items-center overflow-hidden rounded-[28px] bg-panel transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-30px_rgba(28,32,53,0.25)]">
        {children}
      </div>
      <span className="mt-6 inline-block rounded-lg bg-lime-soft px-3.5 py-2 text-[15px] font-medium">{tag}</span>
      <h3 className="mt-4 text-[22px] font-medium tracking-[-0.03em]">{title}</h3>
      <p className="mt-3 max-w-[620px] text-[17px] leading-snug text-body">{text}</p>
    </Reveal>
  )
}

export function ExtraFeatures() {
  return (
    <section id="extra" className="container-x py-24 sm:py-32">
      <SectionHeading
        label="EXTRA FEATURES"
        title={
          <>
            Seamless operations
            <br />
            and better outcomes.
          </>
        }
        description="Say goodbye to spreadsheets and scattered systems. Keep detailed employee records."
      />

      <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-5">
        <FeatureCard tag="Smarter" title="Smart Notifications & Reminders" text="Stay ahead of critical tasks with automatic alerts and deadlines.">
          <img
            src="/assets/notification.webp"
            alt="Attendance notification card"
            className="w-[48%] transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105"
          />
        </FeatureCard>

        <FeatureCard
          delay={0.12}
          tag="Integrates"
          title="Plug-and-play integrations with your favorite tools"
          text="Give employees control over their own data—from updating personal info to managing leave requests—all through a secure, intuitive portal."
        >
          <img src="/assets/int-center.svg" alt="Hirely" className="relative z-10 w-[20%] transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110" />
          {TILES.map((tile) => (
            <img
              key={tile.src}
              src={tile.src}
              alt=""
              style={{ animationDelay: tile.delay }}
              className={`animate-float absolute w-[11%] rounded-2xl shadow-[0_10px_24px_-12px_rgba(28,32,53,0.25)] ${tile.className}`}
            />
          ))}
        </FeatureCard>
      </div>
    </section>
  )
}
