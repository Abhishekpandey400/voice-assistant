const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })
const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric' })

export const formatDateTime = (value: string) => dateTime.format(new Date(value))
export const formatTime = (value: string) => time.format(new Date(value))
export const formatDay = (value: string) => weekday.format(new Date(`${value}T00:00:00`))
export const formatMs = (value: number | null | undefined) =>
  value == null ? '—' : value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${Math.round(value)} ms`
export const splitWords = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1 $2')
