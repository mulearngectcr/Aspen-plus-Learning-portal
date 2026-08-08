import { Router } from 'express'
import { AppError } from '../lib/AppError.js'
import { serializeNotification } from '../lib/notifications.js'
import { supabase } from '../lib/supabase.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const notificationsRouter = Router()

notificationsRouter.get('/', async (req, res) => {
  const requestedLimit = Number.parseInt(String(req.query.limit ?? '50'), 10)
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, target_type, target_id, is_read, created_at, streak_days')
    .eq('recipient_id', req.user!.id)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new AppError(500, 'Could not load notifications.')
  res.json({ notifications: (data ?? []).map(serializeNotification) })
})

notificationsRouter.patch('/read-all', async (req, res) => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', req.user!.id).eq('is_read', false)
  if (error) throw new AppError(500, 'Could not mark notifications as read.')
  res.status(204).end()
})

notificationsRouter.patch('/:id/read', async (req, res) => {
  if (!UUID.test(req.params.id)) throw new AppError(400, 'Invalid notification ID.')
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', req.params.id)
    .eq('recipient_id', req.user!.id)
    .select('id')
    .maybeSingle()
  if (error) throw new AppError(500, 'Could not mark the notification as read.')
  if (!data) throw new AppError(404, 'Notification not found.')
  res.status(204).end()
})
