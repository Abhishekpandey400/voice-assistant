import { Bot, Keyboard, Mic, UserRound } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import type { Message } from '@/lib/api/types'

export function Transcript({ messages, assistantName }: { messages: Message[]; assistantName: string }) {
  return (
    <ol className="space-y-4">
      {messages.map((message) => {
        const fromUser = message.sender === 'User'
        return (
          <li key={message.id} className={`animate-fade-up flex gap-3 ${fromUser ? 'flex-row-reverse' : ''}`}>
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full ${fromUser ? 'bg-slate-900 text-white' : 'bg-brand-50 text-brand-600'}`}
            >
              {fromUser ? <UserRound className="size-4" /> : <Bot className="size-4" />}
            </span>
            <div className={`max-w-[80%] ${fromUser ? 'text-right' : ''}`}>
              <div
                className={`inline-block whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed ${
                  fromUser ? 'rounded-tr-sm bg-slate-900 text-white' : 'rounded-tl-sm bg-slate-100 text-slate-800'
                }`}
              >
                {message.content}
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 [justify-content:inherit]">
                {fromUser ? (
                  <>
                    {message.inputMode === 'Voice' ? <Mic className="size-3" /> : <Keyboard className="size-3" />}
                    You · {formatTime(message.createdAt)}
                  </>
                ) : (
                  <>
                    {assistantName} · {formatTime(message.createdAt)}
                  </>
                )}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
