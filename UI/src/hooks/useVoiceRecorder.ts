import { useCallback, useEffect, useRef, useState } from 'react'

interface Options {
  onRecorded: (audio: Blob) => void
  onNoSpeech: () => void
  silenceMs?: number
  maxDurationMs?: number
  waitForSpeechMs?: number
}

const SPEECH_THRESHOLD = 0.035
const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

export function useVoiceRecorder({ onRecorded, onNoSpeech, silenceMs = 1500, maxDurationMs = 30000, waitForSpeechMs = 8000 }: Options) {
  const [isRecording, setIsRecording] = useState(false)
  const [level, setLevel] = useState(0)
  const callbacks = useRef({ onRecorded, onNoSpeech })
  const streamRef = useRef<MediaStream | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const frameRef = useRef(0)

  callbacks.current = { onRecorded, onNoSpeech }

  const ensureStream = useCallback(async () => {
    if (streamRef.current?.active && analyserRef.current) return
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })
    const context = new AudioContext()
    const analyser = context.createAnalyser()
    analyser.fftSize = 1024
    context.createMediaStreamSource(stream).connect(analyser)
    streamRef.current = stream
    contextRef.current = context
    analyserRef.current = analyser
  }, [])

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined')
      throw new Error('Voice recording is not supported in this browser.')

    await ensureStream()
    await contextRef.current?.resume()

    const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type))
    const recorder = new MediaRecorder(streamRef.current!, mimeType ? { mimeType } : undefined)
    const chunks: Blob[] = []
    const startedAt = performance.now()
    const samples = new Uint8Array(analyserRef.current!.fftSize)
    let heardSpeech = false
    let lastVoiceAt = startedAt

    recorder.ondataavailable = (event) => event.data.size > 0 && chunks.push(event.data)
    recorder.onstop = () => {
      cancelAnimationFrame(frameRef.current)
      setIsRecording(false)
      setLevel(0)
      if (heardSpeech && chunks.length) callbacks.current.onRecorded(new Blob(chunks, { type: recorder.mimeType }))
      else callbacks.current.onNoSpeech()
    }

    const monitor = () => {
      analyserRef.current!.getByteTimeDomainData(samples)
      const rms = Math.sqrt(samples.reduce((sum, value) => sum + ((value - 128) / 128) ** 2, 0) / samples.length)
      const now = performance.now()
      setLevel(Math.min(1, rms * 8))

      if (rms > SPEECH_THRESHOLD) {
        heardSpeech = true
        lastVoiceAt = now
      }

      const silentTooLong = heardSpeech && now - lastVoiceAt > silenceMs
      const nobodySpoke = !heardSpeech && now - startedAt > waitForSpeechMs
      if (silentTooLong || nobodySpoke || now - startedAt > maxDurationMs) recorder.stop()
      else frameRef.current = requestAnimationFrame(monitor)
    }

    recorderRef.current = recorder
    recorder.start(250)
    setIsRecording(true)
    frameRef.current = requestAnimationFrame(monitor)
  }, [ensureStream, maxDurationMs, silenceMs, waitForSpeechMs])

  const release = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder?.state === 'recording') {
      recorder.onstop = null
      recorder.stop()
    }
    cancelAnimationFrame(frameRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    contextRef.current?.close().catch(() => undefined)
    streamRef.current = null
    contextRef.current = null
    analyserRef.current = null
    setIsRecording(false)
    setLevel(0)
  }, [])

  useEffect(() => release, [release])

  return { isRecording, level, start, stop, release }
}
