import { MessageSquarePlus, PhoneOff, Send, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Transcript } from '@/components/data/Transcript'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { inputClass } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { VoiceOrb, type VoicePhase } from '@/components/voice/VoiceOrb'
import { useSpeaker } from '@/hooks/useSpeaker'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { api } from '@/lib/api'
import { formatDateTime, formatMs } from '@/lib/utils'
import type { Conversation, ConversationDetail, InteractionResult, Message, Role } from '@/lib/api/types'

const PERSONAS: Partial<Record<Role, { name: string; tagline: string; starters: string[] }>> = {
  Student: {
    name: 'Study Buddy',
    tagline: 'Ask anything you are learning. I explain step by step and check your understanding.',
    starters: ['Explain photosynthesis in simple words', 'Quiz me on fractions', 'How should I prepare for my exams?'],
  },
  Teacher: {
    name: 'Teaching Assistant',
    tagline: 'Plan lessons, draft quizzes and rubrics, and get classroom strategies hands-free.',
    starters: ['Plan a 40 minute lesson on the water cycle', 'Create five quiz questions on the solar system', 'Suggest a rubric for a persuasive essay'],
  },
}

const PHASE_TEXT: Record<VoicePhase, string> = {
  idle: 'Tap the microphone or start a hands-free conversation',
  listening: 'Listening… pause when you are done',
  thinking: 'Transcribing and thinking…',
  speaking: 'Speaking… tap to interrupt',
}

export function AssistantPage() {
  const { user } = useAuth()
  const persona = PERSONAS[user!.role]!
  const [conversations, setConversations] = useState<Conversation[] | null>(null)
  const [active, setActive] = useState<ConversationDetail | null>(null)
  const [phase, setPhase] = useState<VoicePhase>('idle')
  const [handsFree, setHandsFree] = useState(false)
  const [muted, setMuted] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastMeta, setLastMeta] = useState<Pick<InteractionResult, 'provider' | 'model' | 'latencyMs'> | null>(null)
  const handsFreeRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const speaker = useSpeaker()

  handsFreeRef.current = handsFree

  const refreshList = useCallback(() => api<Conversation[]>('/conversations').then(setConversations), [])

  useEffect(() => {
    refreshList().catch((err: Error) => setError(err.message))
  }, [refreshList])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [active?.messages.length, phase])

  const ensureConversation = async () => {
    if (active) return active
    const created = await api<Conversation>('/conversations', { method: 'POST', json: {} })
    const detail: ConversationDetail = {
      ...created,
      ownerId: user!.id,
      ownerName: user!.fullName,
      ownerRole: user!.role,
      messages: [],
    }
    setActive(detail)
    return detail
  }

  const openConversation = async (id: string) => {
    stopEverything()
    setError(null)
    setActive(await api<ConversationDetail>(`/conversations/${id}`))
    setLastMeta(null)
  }

  const appendExchange = (conversationId: string, result: InteractionResult) => {
    setActive((current) =>
      current && current.id === conversationId
        ? { ...current, messages: [...current.messages, result.userMessage, result.assistantMessage] }
        : current,
    )
    setLastMeta({ provider: result.provider, model: result.model, latencyMs: result.latencyMs })
    refreshList().catch(() => undefined)
  }

  const respond = async (reply: Message) => {
    if (muted || !speaker.supported) {
      setPhase('idle')
      if (handsFreeRef.current) listen()
      return
    }
    setPhase('speaking')
    await speaker.speak(reply.content)
    setPhase((current) => (current === 'speaking' ? 'idle' : current))
    if (handsFreeRef.current) listen()
  }

  const send = async (request: (conversationId: string) => Promise<InteractionResult>) => {
    setError(null)
    setPhase('thinking')
    try {
      const conversation = await ensureConversation()
      const result = await request(conversation.id)
      appendExchange(conversation.id, result)
      await respond(result.assistantMessage)
    } catch (err) {
      setError((err as Error).message)
      setHandsFree(false)
      setPhase('idle')
    }
  }

  const recorder = useVoiceRecorder({
    onRecorded: (audio) => {
      const form = new FormData()
      form.append('audio', audio, `speech.${audio.type.includes('mp4') ? 'm4a' : audio.type.includes('ogg') ? 'ogg' : 'webm'}`)
      send((id) => api<InteractionResult>(`/conversations/${id}/voice`, { method: 'POST', form }))
    },
    onNoSpeech: () => {
      setPhase('idle')
      if (handsFreeRef.current) {
        setHandsFree(false)
        setError('I did not hear anything, so I paused the conversation. Tap the microphone when you are ready.')
      }
    },
  })

  const listen = async () => {
    setError(null)
    try {
      await recorder.start()
      setPhase('listening')
    } catch (err) {
      const denied = (err as DOMException).name === 'NotAllowedError'
      setError(denied ? 'Microphone access was blocked. Allow it in your browser settings or type your message below.' : (err as Error).message)
      setHandsFree(false)
      setPhase('idle')
    }
  }

  function stopEverything() {
    setHandsFree(false)
    speaker.cancel()
    recorder.release()
    setPhase('idle')
  }

  const onOrbClick = () => {
    if (phase === 'listening') recorder.stop()
    else if (phase === 'speaking') {
      speaker.cancel()
      setPhase('idle')
      if (handsFree) listen()
    } else listen()
  }

  const startHandsFree = async () => {
    setHandsFree(true)
    handsFreeRef.current = true
    try {
      await ensureConversation()
      await listen()
    } catch (err) {
      setError((err as Error).message)
      setHandsFree(false)
    }
  }

  const sendText = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || phase === 'thinking') return
    setDraft('')
    send((id) => api<InteractionResult>(`/conversations/${id}/messages`, { method: 'POST', json: { text: trimmed } }))
  }

  const newConversation = () => {
    stopEverything()
    setActive(null)
    setLastMeta(null)
    setError(null)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden lg:sticky lg:top-22">
        <div className="border-b border-slate-200 p-4">
          <Button variant="secondary" className="w-full" onClick={newConversation}>
            <MessageSquarePlus className="size-4" />
            New conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations === null ? (
            <Spinner />
          ) : conversations.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">No conversations yet.</p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    onClick={() => openConversation(conversation.id).catch((err: Error) => setError(err.message))}
                    className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                      active?.id === conversation.id ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="block truncate text-sm font-medium">{conversation.title}</span>
                    <span className="block text-xs text-slate-500">
                      {formatDateTime(conversation.lastActivityAt)} · {conversation.messageCount} messages
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-b from-brand-50/70 to-white px-6 pb-8 pt-6 text-center">
            <div className="flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
                <Sparkles className="size-3.5" /> {persona.name}
              </p>
              <button
                onClick={() => {
                  setMuted((value) => !value)
                  speaker.cancel()
                }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-white"
                title={muted ? 'Spoken replies are off' : 'Spoken replies are on'}
              >
                {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                {muted ? 'Voice off' : 'Voice on'}
              </button>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">Hi {user!.fullName.split(' ')[0]}, what shall we work on?</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{persona.tagline}</p>

            <div className="mt-6 flex justify-center">
              <VoiceOrb phase={phase} level={recorder.level} onClick={onOrbClick} />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-600" aria-live="polite">
              {PHASE_TEXT[phase]}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {handsFree ? (
                <Button variant="danger" onClick={stopEverything}>
                  <PhoneOff className="size-4" /> End conversation
                </Button>
              ) : (
                <Button onClick={startHandsFree} disabled={phase !== 'idle'}>
                  <Sparkles className="size-4" /> Start conversation
                </Button>
              )}
            </div>
            {handsFree && <p className="mt-2 text-xs text-slate-500">Hands-free mode: I will keep listening after each reply.</p>}
          </div>
        </Card>

        {error && <Alert onClose={() => setError(null)}>{error}</Alert>}

        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">{active?.title ?? 'New conversation'}</h2>
            {lastMeta && (
              <p className="text-xs text-slate-500">
                Answered by {lastMeta.provider} · {lastMeta.model} · {formatMs(lastMeta.latencyMs)}
              </p>
            )}
          </div>

          <div className="mt-5 min-h-40">
            {active && active.messages.length > 0 ? (
              <Transcript messages={active.messages} assistantName={persona.name} />
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-500">Try one of these to get started:</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {persona.starters.map((starter) => (
                    <button
                      key={starter}
                      onClick={() => sendText(starter)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {phase === 'thinking' && <Spinner label="Working on it…" />}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault()
              sendText(draft)
            }}
            className="mt-6 flex gap-2 border-t border-slate-100 pt-4"
          >
            <input
              className={inputClass}
              placeholder="Prefer typing? Write your message here"
              value={draft}
              maxLength={2000}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button type="submit" disabled={!draft.trim() || phase === 'thinking'} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
