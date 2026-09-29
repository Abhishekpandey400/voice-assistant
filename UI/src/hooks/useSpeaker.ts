import { useCallback, useEffect, useRef, useState } from 'react'

const PREFERRED_VOICES = [/Google US English/i, /Microsoft (Aria|Jenny|Ava).*Natural/i, /Samantha/i, /Google UK English Female/i]

function pickVoice(voices: SpeechSynthesisVoice[]) {
  for (const pattern of PREFERRED_VOICES) {
    const match = voices.find((voice) => pattern.test(voice.name))
    if (match) return match
  }
  return voices.find((voice) => voice.lang.startsWith('en')) ?? null
}

export function useSpeaker() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [isSpeaking, setIsSpeaking] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const runRef = useRef(0)

  useEffect(() => {
    if (!supported) return
    const load = () => (voiceRef.current = pickVoice(window.speechSynthesis.getVoices()))
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [supported])

  const cancel = useCallback(() => {
    runRef.current++
    if (supported) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [supported])

  const speak = useCallback(
    async (text: string) => {
      if (!supported || !text.trim()) return
      cancel()
      const run = runRef.current
      const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text]
      setIsSpeaking(true)

      for (const sentence of sentences) {
        if (run !== runRef.current) return
        await new Promise<void>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(sentence.trim())
          utterance.voice = voiceRef.current
          utterance.rate = 1.02
          utterance.onend = () => resolve()
          utterance.onerror = () => resolve()
          window.speechSynthesis.speak(utterance)
        })
      }

      if (run === runRef.current) setIsSpeaking(false)
    },
    [cancel, supported],
  )

  return { supported, isSpeaking, speak, cancel }
}
