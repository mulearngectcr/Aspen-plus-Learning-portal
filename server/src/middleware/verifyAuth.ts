import type { NextFunction, Request, Response } from 'express'
import { supabase } from '../lib/supabase.js'

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const match = /^Bearer\s+(.+)$/i.exec(req.header('authorization') ?? '')
  if (!match) return res.status(401).json({ error: 'Authentication required.' })

  const token = match[1]
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user) return res.status(401).json({ error: 'Invalid or expired session.' })

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_admin, is_banned, full_name, username, avatar_url, batch, current_streak, longest_streak, last_post_date, created_at')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (profileError || !profile) return res.status(401).json({ error: 'Account profile is unavailable.' })

  req.user = { id: userData.user.id, email: userData.user.email ?? null }
  req.profile = profile

  if (WRITE_METHODS.has(req.method) && profile.is_banned) {
    return res.status(403).json({ error: 'This account is banned from making changes.' })
  }

  next()
}
