import { Router } from 'express'
import { AppError } from '../lib/AppError.js'
import { supabase } from '../lib/supabase.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const limitFrom = (value: unknown, fallback = 25) => { const n = Number.parseInt(String(value ?? fallback), 10); return Number.isFinite(n) ? Math.min(Math.max(n, 1), 100) : fallback }
const profileOf = (value: unknown) => Array.isArray(value) ? value[0] : value
function reasonFrom(value: unknown) { if (typeof value !== 'string' || !value.trim()) throw new AppError(400, 'A moderation reason is required.'); return value.trim().slice(0, 2_000) }

function adminPost(row: any) {
  const author = profileOf(row.profiles)
  return { id: row.id, content: row.content, image_url_1: row.image_url_1, image_url_2: row.image_url_2, created_at: row.created_at, post_date: row.post_date, is_deleted: row.is_deleted, author: { full_name: author?.full_name ?? 'Unknown', username: author?.username ?? '', avatar_url: author?.avatar_url ?? null } }
}
function adminComment(row: any) {
  const author = profileOf(row.profiles)
  return { id: row.id, post_id: row.post_id, parent_comment_id: row.parent_comment_id, content: row.content, created_at: row.created_at, is_deleted: row.is_deleted, author: { full_name: author?.full_name ?? 'Unknown', username: author?.username ?? '', avatar_url: author?.avatar_url ?? null }, replies: [] as any[] }
}
function commentTree(rows: any[]) {
  const comments = new Map(rows.map((row) => [row.id, adminComment(row)])); const roots: any[] = []
  for (const comment of comments.values()) { const parent = comment.parent_comment_id ? comments.get(comment.parent_comment_id) : null; if (parent) parent.replies.push(comment); else roots.push(comment) }
  return roots
}

export const adminRouter = Router()

adminRouter.get('/posts', async (req, res) => {
  const includeDeleted = req.query.includeDeleted === 'true'; const limit = limitFrom(req.query.limit)
  let query = supabase.from('posts').select('id, content, image_url_1, image_url_2, created_at, post_date, is_deleted, profiles!inner(full_name, username, avatar_url)').order('created_at', { ascending: false }).order('id', { ascending: false }).limit(limit + 1)
  if (!includeDeleted) query = query.eq('is_deleted', false)
  if (typeof req.query.cursor === 'string') { const [createdAt, id] = req.query.cursor.split('|'); if (!createdAt || !UUID.test(id)) throw new AppError(400, 'Invalid cursor.'); query = query.or(`created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`) }
  const { data, error } = await query
  if (error) throw new AppError(500, 'Could not load admin posts.')
  const hasMore = (data?.length ?? 0) > limit
  const page = hasMore ? data!.slice(0, limit) : (data ?? [])
  const posts = page.map(adminPost); const last = page.at(-1)
  res.json({ posts, next_cursor: hasMore && last ? `${last.created_at}|${last.id}` : null })
})

adminRouter.get('/comments', async (req, res) => {
  const postId = req.query.postId
  if (typeof postId !== 'string' || !UUID.test(postId)) throw new AppError(400, 'A valid postId is required.')
  const { data, error } = await supabase.from('comments').select('id, post_id, parent_comment_id, content, created_at, is_deleted, profiles!inner(full_name, username, avatar_url)').eq('post_id', postId).order('created_at', { ascending: true })
  if (error) throw new AppError(500, 'Could not load admin comments.')
  res.json({ comments: commentTree(data ?? []) })
})

adminRouter.delete('/posts/:id', async (req, res) => {
  if (!UUID.test(req.params.id)) throw new AppError(400, 'Invalid post ID.'); const reason = reasonFrom(req.body?.reason)
  const { data, error } = await supabase.from('posts').update({ is_deleted: true }).eq('id', req.params.id).eq('is_deleted', false).select('id').maybeSingle()
  if (error) throw new AppError(500, 'Could not delete post.'); if (!data) throw new AppError(404, 'Post not found.')
  const { error: logError } = await supabase.from('moderation_log').insert({ admin_id: req.user!.id, action: 'delete_post', target_type: 'post', target_id: req.params.id, reason })
  if (logError) throw new AppError(500, 'Post removed but could not log moderation.')
  res.status(204).end()
})

adminRouter.delete('/comments/:id', async (req, res) => {
  if (!UUID.test(req.params.id)) throw new AppError(400, 'Invalid comment ID.'); const reason = reasonFrom(req.body?.reason)
  const { data, error } = await supabase.from('comments').update({ is_deleted: true }).eq('id', req.params.id).eq('is_deleted', false).select('id').maybeSingle()
  if (error) throw new AppError(500, 'Could not delete comment.'); if (!data) throw new AppError(404, 'Comment not found.')
  const { error: logError } = await supabase.from('moderation_log').insert({ admin_id: req.user!.id, action: 'delete_comment', target_type: 'comment', target_id: req.params.id, reason })
  if (logError) throw new AppError(500, 'Comment removed but could not log moderation.')
  res.status(204).end()
})

adminRouter.get('/moderation-log', async (req, res) => {
  const limit = limitFrom(req.query.limit, 50)
  let query = supabase.from('moderation_log').select('id, action, target_type, target_id, reason, created_at, profiles!inner(full_name, username)').order('created_at', { ascending: false }).order('id', { ascending: false }).limit(limit + 1)
  if (typeof req.query.cursor === 'string') {
    const [createdAt, id] = req.query.cursor.split('|')
    if (!createdAt || !UUID.test(id)) throw new AppError(400, 'Invalid cursor.')
    query = query.or(`created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`)
  }
  const { data, error } = await query
  if (error) throw new AppError(500, 'Could not load moderation log.')
  const hasMore = (data?.length ?? 0) > limit
  const page = hasMore ? data!.slice(0, limit) : (data ?? [])
  const entries = page.map((row: any) => { const admin = profileOf(row.profiles); return { id: row.id, action: row.action, target_type: row.target_type, target_id: row.target_id, reason: row.reason, created_at: row.created_at, admin: { full_name: admin?.full_name ?? 'Unknown', username: admin?.username ?? '' } } })
  const last = page.at(-1)
  res.json({ entries, next_cursor: hasMore && last ? `${last.created_at}|${last.id}` : null })
})

adminRouter.get('/users', async (req, res) => {
  const { data, error } = await supabase.rpc('get_admin_users')
  if (error) throw new AppError(500, 'Could not load users.')
  const query = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : ''
  const users = (data ?? []).filter((user: any) => !query || user.full_name.toLowerCase().includes(query) || user.username.toLowerCase().includes(query))
  res.json({ users })
})

async function setBan(req: any, res: any, banned: boolean) {
  if (!UUID.test(req.params.id)) throw new AppError(400, 'Invalid user ID.'); if (req.params.id === req.user.id) throw new AppError(400, 'You cannot change your own admin access.'); const reason = reasonFrom(req.body?.reason)
  const { data, error } = await supabase.from('profiles').update({ is_banned: banned }).eq('id', req.params.id).select('id').maybeSingle()
  if (error) throw new AppError(500, 'Could not update user.'); if (!data) throw new AppError(404, 'User not found.')
  const { error: logError } = await supabase.from('moderation_log').insert({ admin_id: req.user.id, action: banned ? 'ban_user' : 'unban_user', target_type: 'profile', target_id: req.params.id, reason })
  if (logError) throw new AppError(500, 'User updated but could not log moderation.')
  res.status(204).end()
}
adminRouter.patch('/users/:id/ban', (req, res) => setBan(req, res, true))
adminRouter.patch('/users/:id/unban', (req, res) => setBan(req, res, false))
