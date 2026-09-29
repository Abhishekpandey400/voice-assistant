import { Loader2, Mic, Square, Volume2 } from 'lucide-react'

export type VoicePhase = 'idle' | 'listening' | 'thinking' | 'speaking'

const phaseStyles: Record<VoicePhase, string> = {
  idle: 'from-brand-500 to-violet-600',
  listening: 'from-rose-500 to-pink-600',
  thinking: 'from-amber-400 to-orange-500',
  speaking: 'from-emerald-500 to-teal-600',
}

const phaseLabels: Record<VoicePhase, string> = {
  idle: 'Start speaking',
  listening: 'Stop and send',
  thinking: 'Thinking',
  speaking: 'Stop speaking',
}

export function VoiceOrb({ phase, level, onClick, disabled }: { phase: VoicePhase; level: number; onClick: () => void; disabled?: boolean }) {
  const Icon = phase === 'listening' ? Square : phase === 'thinking' ? Loader2 : phase === 'speaking' ? Volume2 : Mic
  const scale = phase === 'listening' ? 1 + level * 0.35 : 1

  return (
    <div className="relative grid size-56 place-items-center">
      {phase !== 'idle' && (
        <>
          <span className={`animate-orb-pulse absolute inset-0 rounded-full bg-gradient-to-br ${phaseStyles[phase]}`} />
          <span className={`animate-orb-pulse absolute inset-6 rounded-full bg-gradient-to-br ${phaseStyles[phase]} [animation-delay:0.4s]`} />
        </>
      )}
      <span
        className={`absolute inset-10 rounded-full bg-gradient-to-br opacity-30 blur-xl transition-transform duration-100 ${phaseStyles[phase]}`}
        style={{ transform: `scale(${scale * 1.1})` }}
      />
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || phase === 'thinking'}
        aria-label={phaseLabels[phase]}
        title={phaseLabels[phase]}
        className={`relative grid size-32 place-items-center rounded-full bg-gradient-to-br text-white shadow-xl transition-all duration-100 hover:brightness-110 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand-500/40 disabled:cursor-not-allowed disabled:opacity-70 ${phaseStyles[phase]}`}
        style={{ transform: `scale(${scale})` }}
      >
        <Icon className={`size-12 ${phase === 'thinking' ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )
}
