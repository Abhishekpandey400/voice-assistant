import { useState, type FormEvent } from 'react'
import { Reveal } from '@/components/Reveal'

const COLUMNS = [
  { title: 'Pages', links: ['Features', 'Company', 'Article', 'Article Single', 'Pricing'] },
  { title: 'Utility', links: ['404'], extra: { title: 'Policy', links: ['Privacy Policy', 'Terms & Conditions'] } },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const subscribe = (event: FormEvent) => {
    event.preventDefault()
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="container-x pb-10 pt-16">
      <Reveal className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <img src="/assets/logo.svg" alt="Hirely" className="h-[27px] w-auto" />
          <p className="mt-12 text-[16px] text-body">Email</p>
          <a href="mailto:support@onixtheme.com" className="mt-1 inline-block text-[16px] font-medium transition-colors hover:text-body">
            support@onixtheme.com
          </a>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title} className="space-y-8">
            {[column, column.extra].filter(Boolean).map((group) => (
              <div key={group!.title}>
                <p className="text-[16px] text-body">{group!.title}</p>
                <ul className="mt-2 space-y-2">
                  {group!.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[16px] transition-all duration-300 hover:pl-1 hover:text-body">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}

        <div>
          <p className="text-[22px] font-medium tracking-[-0.03em]">Newsletter</p>
          <form onSubmit={subscribe} className="mt-5 flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              aria-label="Email address"
              className="min-w-0 flex-1 rounded-xl bg-panel px-4 py-3 text-[16px] outline-none ring-lime transition focus:ring-2"
            />
            <button className="rounded-xl bg-ink px-4 py-3 text-[16px] font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2b3050]">
              Subscribe
            </button>
          </form>
          {subscribed && <p className="mt-3 text-[15px] text-body">Thanks! You're on the list.</p>}
        </div>
      </Reveal>

      <p className="mt-16 border-t border-line pt-8 text-center text-[15px] text-body">
        © Copyright 2025 | Design &amp; Developed By Onixtheme - License | Powered By Framer
      </p>
    </footer>
  )
}
