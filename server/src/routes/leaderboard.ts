import { Router } from 'express'
import { AppError } from '../lib/AppError.js'
import { supabase } from '../lib/supabase.js'

export const leaderboardRouter = Router()

leaderboardRouter.get('/', async (req, res) => {
  const requestedLimit = Number.parseInt(String(req.query.limit ?? '10'), 10)
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 25) : 10
  const { data, error } = await supabase.rpc('get_weekly_leaderboard', { p_viewer_id: req.user!.id, p_limit: limit })
  if (error) throw new AppError(500, 'Could not load the weekly leaderboard.')

  const rows = data ?? []
  const mine = rows.find((row: any) => row.user_id === req.user!.id)
  res.json({
    leaderboard: rows.filter((row: any) => Number(row.leaderboard_rank) <= limit).map((row: any) => ({ rank: Number(row.leaderboard_rank), streak: Number(row.streak) })),
    your_rank: mine ? Number(mine.leaderboard_rank) : null,
    your_streak: mine ? Number(mine.streak) : 0,
  })
})
