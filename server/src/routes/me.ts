import { Router } from 'express'
import { env } from '../config/env.js'
import { AppError } from '../lib/AppError.js'
import { serializeOwnPost } from '../lib/me.js'
import { supabase } from '../lib/supabase.js'

function daysSince(date: string) {
  const start = new Date(`${date}T00:00:00+05:30`)
  return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86_400_000) + 1)
}

export const meRouter = Router()

meRouter.get('/', async (req, res) => {
  const [calendarResult, postsResult, badgesResult] = await Promise.all([
    supabase.from('streak_calendar').select('date, status').eq('user_id', req.user!.id).order('date', { ascending: true }),
    supabase.from('posts').select('id, content, image_url_1, image_url_2, created_at, post_date').eq('user_id', req.user!.id).eq('is_deleted', false).order('created_at', { ascending: false }),
    supabase.from('user_badges').select('awarded_at, badges!inner(slug, name, description)').eq('user_id', req.user!.id).order('awarded_at', { ascending: false }),
  ])
  if (calendarResult.error || postsResult.error || badgesResult.error) throw new AppError(500, 'Could not load your progress.')
  const startDate = env.bootcampStartDate ?? req.profile!.created_at.slice(0, 10)
  const badges = (badgesResult.data ?? []).map((row: any) => {
    const badge = Array.isArray(row.badges) ? row.badges[0] : row.badges
    return { slug: badge.slug, name: badge.name, description: badge.description, awarded_at: row.awarded_at }
  })
  res.json({ current_streak: req.profile!.current_streak, longest_streak: req.profile!.longest_streak, streak_calendar: calendarResult.data ?? [], posts: (postsResult.data ?? []).map(serializeOwnPost), badges, total_post_count: (postsResult.data ?? []).length, days_in_bootcamp: daysSince(startDate) })
})
