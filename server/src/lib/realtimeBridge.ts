import type { Response } from 'express'
import { supabase } from './supabase.js'

type SafeEvent =
  | { type: 'post_created'; post_id: string }
  | { type: 'feed_changed' }
  | { type: 'comment_created'; post_id: string }
  | { type: 'notification_created' }

type Client = { userId: string; response: Response }
const clients = new Set<Client>()
let started = false

function write(response: Response, event: SafeEvent) {
  response.write(`data: ${JSON.stringify(event)}\n\n`)
}

function broadcast(event: SafeEvent) {
  for (const client of clients) write(client.response, event)
}

function notifyRecipient(recipientId: string) {
  for (const client of clients) {
    if (client.userId === recipientId) write(client.response, { type: 'notification_created' })
  }
}

// Raw database changes enter only this server-side service-role client. The
// browser receives deliberately tiny, identity-free event payloads instead.
export function startRealtimeBridge() {
  if (started) return
  started = true
  supabase
    .channel('express-sanitized-stream')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload: any) => {
      broadcast({ type: 'post_created', post_id: payload.new.id })
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, () => {
      broadcast({ type: 'feed_changed' })
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload: any) => {
      broadcast({ type: 'comment_created', post_id: payload.new.post_id })
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => {
      broadcast({ type: 'feed_changed' })
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload: any) => {
      notifyRecipient(payload.new.recipient_id)
    })
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') console.error(`Realtime bridge status: ${status}`)
    })
}

export function addStreamClient(userId: string, response: Response) {
  const client = { userId, response }
  clients.add(client)
  return () => clients.delete(client)
}
