import { Reveal } from '@/components/Reveal'

const LOGOS = [
  { src: '/assets/brand-attracts2.svg', name: 'attracts' },
  { src: '/assets/brand-exon.svg', name: 'exon' },
  { src: '/assets/brand-elio.svg', name: 'elio' },
  { src: '/assets/brand-relax.svg', name: 'relax' },
  { src: '/assets/brand-olab.svg', name: 'olab' },
]

export function Brands() {
  return (
    <section className="py-10">
      <Reveal>
        <p className="text-center text-[17px] text-body">
          Connect <span className="font-medium text-ink">4,200+</span> High performing team
        </p>
      </Reveal>
      <div className="marquee mx-auto mt-10 max-w-[1080px] overflow-hidden">
        <div className="animate-marquee flex w-max items-center hover:[animation-play-state:paused]">
          {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((logo, index) => (
            <img
              key={index}
              src={logo.src}
              alt={logo.name}
              className="mx-12 h-6 w-auto opacity-80 grayscale transition-all duration-300 hover:scale-110 hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
