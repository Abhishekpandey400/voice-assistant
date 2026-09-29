import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/Button'
import { Reveal } from '@/components/Reveal'

const FAQS = [
  {
    question: 'What features are included in the HR management app?',
    answer:
      'Our app offers employee onboarding, leave management, attendance tracking, payroll integration, performance reviews, and document storage—everything you need to streamline your HR processes.',
  },
  {
    question: 'How do I get started on Zaift?',
    answer: 'Sign up for a free account, invite your team, and import your employee data. Our onboarding guide walks you through payroll setup in minutes.',
  },
  {
    question: 'Is the app suitable for small and medium-sized businesses?',
    answer: 'Yes. Hirely is built to scale, from a five-person startup to growing teams with hundreds of employees, with plans that grow with you.',
  },
  {
    question: 'Can I integrate this app with other tools we use?',
    answer: 'Hirely connects with major accounting software, pension schemes, and collaboration tools, so your data flows without manual work.',
  },
  {
    question: 'How secure is our employee data on this platform?',
    answer: 'Employee data is encrypted in transit and at rest, access is role-based, and every change is logged for a complete audit trail.',
  },
]

export function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="container-x grid gap-12 py-24 sm:py-32 lg:grid-cols-2 lg:gap-16">
      <div>
        <Reveal>
          <h2 className="heading text-[40px] sm:text-[52px] lg:text-[60px]">
            Frequenlty asked
            <br />
            questions
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-9">
          <Button variant="mist" arrow>
            Try Hirely
          </Button>
        </Reveal>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, index) => {
          const isOpen = open === index
          return (
            <Reveal key={faq.question} delay={index * 0.06}>
              <div
                className={`overflow-hidden rounded-3xl transition-colors duration-500 ${
                  isOpen ? 'bg-lime-soft shadow-[0_2px_0_0_#ddffcd]' : 'bg-panel hover:bg-mist'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-8 py-6 text-left text-[17px] font-medium tracking-[-0.02em]"
                >
                  {faq.question}
                  <ChevronDown className={`size-5 shrink-0 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="mx-1 mb-1 rounded-[22px] bg-white px-7 py-6 text-[17px] leading-snug">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
