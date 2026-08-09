import { apiBaseUrl } from '../lib/apiClient'
import { supabase } from '../lib/supabase'

// EventSource cannot send an Authorization header. This small fetch-based SSE
// reader keeps the JWT out of URLs, browser history, and proxy logs.
export function openSanitizedStream(onEvent) {
  let closed = false
  let controller = null
  let reconnectTimer = null

  const scheduleReconnect = () => {
    if (!closed) reconnectTimer = window.setTimeout(() => void connect(), 3_000)
  }

  const dispatch = (block) => {
    const data = block.split('\n').find((line) => line.startsWith('data: '))?.slice(6)
    if (!data) return
    try { onEvent(JSON.parse(data)) } catch { /* Ignore malformed stream frames. */ }
  }

  const connect = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return scheduleReconnect()
      controller = new AbortController()
      const response = await fetch(`${apiBaseUrl}/stream`, {
        headers: { Authorization: `Bearer ${session.access_token}`, Accept: 'text/event-stream' },
        signal: controller.signal,
      })
      if (!response.ok || !response.body) throw new Error('Stream connection failed.')
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''
      while (!closed) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const frames = buffer.split('\n\n'); buffer = frames.pop() ?? ''
        frames.forEach(dispatch)
      }
    } catch (error) {
      if (!closed && error?.name !== 'AbortError') scheduleReconnect()
      return
    }
    scheduleReconnect()
  }

  void connect()
  return () => { closed = true; controller?.abort(); if (reconnectTimer) window.clearTimeout(reconnectTimer) }
}
