import { Router } from 'express'
import { AppError } from '../lib/AppError.js'
import { buildCommentTree } from '../lib/comments.js'
import { serializePost } from '../lib/posts.js'
import { supabase } from '../lib/supabase.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function optionalImageUrl(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || value.length > 2_000) throw new AppError(400, `${field} must be a valid image URL.`)
  try { return new URL(value).toString() } catch { throw new AppError(400, `${field} must be a valid image URL.`) }
}

export const postsRouter = Router()

postsRouter.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params
  if (!UUID.test(postId)) throw new AppError(400, 'Invalid post ID.')
  const { data: post, error: postError } = await supabase.from('posts').select('id').eq('id', postId).eq('is_deleted', false).maybeSingle()
  if (postError || !post) throw new AppError(404, 'Post not found.')
  const { data, error } = await supabase.rpc('get_post_comment_thread', { p_post_id: postId, p_viewer_id: req.user!.id, p_is_admin: req.profile!.is_admin })
  if (error) throw new AppError(500, 'Could not load comments.')
  res.json({ comments: buildCommentTree(data ?? []) })
})

postsRouter.post('/', async (req, res) => {
  const { content, image_url_1, image_url_2 } = req.body ?? {}
  if (typeof content !== 'string' || !content.trim() || content.length > 3_000) {
    throw new AppError(400, 'Content must be between 1 and 3,000 characters.')
  }
  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: req.user!.id, content: content.trim(), image_url_1: optionalImageUrl(image_url_1, 'image_url_1'), image_url_2: optionalImageUrl(image_url_2, 'image_url_2') })
    .select('id, content, image_url_1, image_url_2, created_at, post_date')
    .single()
  if (error) throw new AppError(500, 'Could not create the post.')

  res.status(201).json(serializePost({ ...data, is_mine: true }))
})

postsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  if (!UUID.test(id)) throw new AppError(400, 'Invalid post ID.')
  const { data: post, error: findError } = await supabase.from('posts').select('id, user_id, is_deleted').eq('id', id).maybeSingle()
  if (findError || !post || post.is_deleted) throw new AppError(404, 'Post not found.')
  const isAdmin = req.profile!.is_admin
  if (post.user_id !== req.user!.id && !isAdmin) throw new AppError(403, 'You cannot delete this post.')

  const { error: deleteError } = await supabase.from('posts').update({ is_deleted: true }).eq('id', id)
  if (deleteError) throw new AppError(500, 'Could not delete the post.')

  if (isAdmin) {
    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 2_000) || null : null
    const { error: logError } = await supabase.from('moderation_log').insert({ admin_id: req.user!.id, action: 'delete_post', target_type: 'post', target_id: id, reason })
    if (logError) throw new AppError(500, 'Post was removed but the moderation log could not be written.')
  }
  res.status(204).end()
})
