import { useEffect } from 'react'
import { Benefits } from '@/sections/Benefits'
import { Brands } from '@/sections/Brands'
import { Cta } from '@/sections/Cta'
import { ExtraFeatures } from '@/sections/ExtraFeatures'
import { Faq } from '@/sections/Faq'
import { Footer } from '@/sections/Footer'
import { Hero } from '@/sections/Hero'
import { KeyFeatures } from '@/sections/KeyFeatures'
import { Navbar } from '@/sections/Navbar'
import { Payroll } from '@/sections/Payroll'
import { Testimonial } from '@/sections/Testimonial'

export default function App() {
  useEffect(() => {
    const target = window.location.hash && document.querySelector(window.location.hash)
    if (target) requestAnimationFrame(() => target.scrollIntoView())
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <KeyFeatures />
        <Testimonial />
        <Payroll />
        <Brands />
        <ExtraFeatures />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  )
}
