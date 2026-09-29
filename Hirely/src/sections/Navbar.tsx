import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useState } from 'react'

const LINKS = [
  { label: 'Home', items: ['Home V1', 'Home V2', 'Home V3'] },
  { label: 'Pages', items: ['About', 'Article', 'Article Single', 'Pricing', '404'] },
  { label: 'Features', href: '#features' },
  { label: 'Company', href: '#company' },
  { label: 'Resources', href: '#faq' },
]

export function Navbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 24))

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/75 shadow-[0_1px_0_rgba(28,32,53,0.06)] backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className={`container-x flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-[68px]' : 'h-[84px]'}`}>
        <div className="flex items-center gap-[126px]">
          <a href="#" aria-label="Hirely home" className="shrink-0">
          <img src="/assets/logo.svg" alt="Hirely" width={92} height={27} className="h-[27px] w-auto" />
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {LINKS.map((link) => (
            <li key={link.label} className="group relative">
              <a
                href={link.href ?? '#'}
                className="flex items-center gap-1 py-2 text-[17px] font-medium tracking-[-0.02em] text-ink transition-opacity hover:opacity-70"
              >
                {link.label}
                {link.items && <ChevronDown className="size-4 transition-transform duration-300 group-hover:rotate-180" />}
              </a>
              {link.items && (
                <div className="invisible absolute left-1/2 top-full -translate-x-1/2 translate-y-2 pt-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <ul className="min-w-44 rounded-2xl border border-line bg-white p-2 shadow-[0_20px_40px_-16px_rgba(28,32,53,0.25)]">
                    {link.items.map((item) => (
                      <li key={item}>
                        <a href="#" className="block rounded-xl px-3 py-2 text-[15px] text-body transition-colors hover:bg-mist hover:text-ink">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <a href="#pricing" className="rounded-xl bg-mist px-4 py-2.5 text-[17px] font-medium tracking-[-0.02em] transition-colors hover:bg-[#e9e9f0]">
            Pricing
          </a>
          <a href="#contact" className="rounded-xl bg-ink px-4 py-2.5 text-[17px] font-medium tracking-[-0.02em] text-white transition-all hover:-translate-y-0.5 hover:bg-[#2b3050]">
            Contact
          </a>
        </div>

        <button onClick={() => setOpen((value) => !value)} className="rounded-xl bg-mist p-2.5 lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href ?? '#'} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-lg font-medium hover:bg-mist">
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 grid grid-cols-2 gap-3">
                <a href="#pricing" className="rounded-xl bg-mist px-4 py-3 text-center font-medium">Pricing</a>
                <a href="#contact" className="rounded-xl bg-ink px-4 py-3 text-center font-medium text-white">Contact</a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
