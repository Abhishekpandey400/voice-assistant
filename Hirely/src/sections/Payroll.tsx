import { Button } from '@/components/Button'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'

export function Payroll() {
  return (
    <section id="payroll" className="container-x py-24 sm:py-32">
      <SectionHeading
        label="APP"
        title={
          <>
            Make payroll a
            <br />
            breeze.
          </>
        }
        description="Hirely connects with the tools you already use to make payroll a breeze."
      />

      <div className="mx-auto mt-16 grid max-w-[1064px] gap-5 lg:grid-cols-[412fr_630fr]">
        <Reveal className="group flex flex-col overflow-hidden rounded-[28px] bg-panel p-8">
          <div className="flex flex-1 items-center justify-center pb-8">
            <img
              src="/assets/payroll-card.webp"
              alt="Payroll card for Tim David with base salary and Pay Now button"
              className="w-[74%] max-w-[270px] transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-[1.03]"
            />
          </div>
          <h3 className="text-[24px] font-medium tracking-[-0.03em]">Accurate &amp; timely payments</h3>
          <p className="mt-3 max-w-[330px] text-[17px] leading-snug text-body">
            Automatically calculate salaries, deductions, and bonuses to ensure employees.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="group relative flex min-h-[460px] flex-col justify-end overflow-hidden rounded-[28px] bg-lime-soft p-8 sm:min-h-[528px]">
          <img
            src="/assets/compliance.webp"
            alt="Hirely compliance dashboard"
            className="absolute right-0 top-[60px] w-[91%] transition-transform duration-700 group-hover:-translate-x-2 group-hover:-translate-y-1"
          />
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-lime-soft via-lime-soft/90 to-transparent" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <h3 className="text-[24px] font-medium tracking-[-0.03em]">Compliance made easy</h3>
              <p className="mt-3 max-w-[360px] text-[17px] leading-snug text-body">
                Stay aligned with local tax laws and labor regulations through built-in compliance features.
              </p>
            </div>
            <Button variant="white" arrow>
              Try Hirely
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
