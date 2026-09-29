import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'

const BENEFITS = [
  { icon: '/assets/benefit-1.svg', title: 'Fully Integrated', text: 'Connects with all major accounting software and pension schemes.' },
  { icon: '/assets/benefit-2.svg', title: 'Expert Support', text: 'Get fast, accurate help from HR and payroll professionals.' },
  { icon: '/assets/benefit-3.svg', title: 'Time-Saving', text: 'Run payroll in minutes, onboard employees easily, automate tasks.' },
]

export function Benefits() {
  return (
    <section id="benefits" className="container-x py-24 sm:py-32">
      <SectionHeading
        label="Benefits"
        title={
          <>
            Save time
            <br />
            Stay compliant
          </>
        }
        description="Simple payroll, integrated HR tools, and expert support, all in one place."
      />

      <div className="mx-auto mt-20 grid max-w-[1080px] gap-12 sm:grid-cols-3 sm:gap-6">
        {BENEFITS.map((benefit, index) => (
          <Reveal key={benefit.title} delay={index * 0.12} className="group flex flex-col items-center px-2 text-center">
            <span className="grid size-12 place-items-center rounded-2xl transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-lime-soft">
              <img src={benefit.icon} alt="" className="size-[30px] transition-transform duration-500 group-hover:rotate-12" />
            </span>
            <h3 className="mt-5 text-[22px] font-medium tracking-[-0.03em]">{benefit.title}</h3>
            <p className="mt-3 max-w-[320px] text-[17px] leading-snug text-body">{benefit.text}</p>
            <span className="mt-2 h-px w-0 bg-line transition-all duration-500 group-hover:w-full" />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
