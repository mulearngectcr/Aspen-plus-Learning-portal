import { Router } from 'express'
import { AppError } from '../lib/AppError.js'
import { serializePost } from '../lib/posts.js'
import { supabase } from '../lib/supabase.js'

type Cursor = { created_at: string; id: string }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function decodeCursor(value: unknown): Cursor | null {
  if (typeof value !== 'string' || !value) return null
  try {
    const cursor = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    if (typeof cursor?.created_at !== 'string' || Number.isNaN(Date.parse(cursor.created_at)) || !UUID.test(cursor.id)) throw new Error()
    return cursor
  } catch { throw new AppError(400, 'Invalid feed cursor.') }
}

function encodeCursor(cursor: Cursor) {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url')
}

export const feedRouter = Router()

feedRouter.get('/', async (req, res) => {
  const cursor = decodeCursor(req.query.cursor)
  const requestedLimit = Number.parseInt(String(req.query.limit ?? '15'), 10)
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 15

  const { data, error } = await supabase.rpc('get_feed_page', {
    p_viewer_id: req.user!.id,
    p_cursor_created_at: cursor?.created_at ?? null,
    p_cursor_id: cursor?.id ?? null,
    p_limit: limit,
  })
  if (error) throw new AppError(500, 'Could not load the feed.')

  const page = data ?? []
  const hasMore = page.length > limit
  const rows = hasMore ? page.slice(0, limit) : page
  const last = rows.at(-1)
  res.json({
    posts: rows.map(serializePost),
    next_cursor: hasMore && last ? encodeCursor({ created_at: last.created_at, id: last.id }) : null,
  })
})
