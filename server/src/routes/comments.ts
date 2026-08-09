import { Router } from 'express'
import { AppError } from '../lib/AppError.js'
import { serializeComment } from '../lib/comments.js'
import { supabase } from '../lib/supabase.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const commentsRouter = Router()

commentsRouter.post('/', async (req, res) => {
  const { post_id, parent_comment_id, content } = req.body ?? {}
  if (typeof post_id !== 'string' || !UUID.test(post_id)) throw new AppError(400, 'Invalid post ID.')
  if (typeof content !== 'string' || !content.trim() || content.length > 1_000) throw new AppError(400, 'Content must be between 1 and 1,000 characters.')
  // The client intentionally sends null for a top-level comment. Only a
  // non-null parent must be a UUID belonging to this post.
  if (parent_comment_id !== undefined && parent_comment_id !== null && (typeof parent_comment_id !== 'string' || !UUID.test(parent_comment_id))) {
    throw new AppError(400, 'Invalid parent comment ID.')
  }

  const { data: post, error: postError } = await supabase.from('posts').select('id').eq('id', post_id).eq('is_deleted', false).maybeSingle()
  if (postError || !post) throw new AppError(404, 'Post not found.')
  if (parent_comment_id) {
    const { data: parent, error: parentError } = await supabase.from('comments').select('id').eq('id', parent_comment_id).eq('post_id', post_id).maybeSingle()
    if (parentError || !parent) throw new AppError(400, 'Parent comment does not belong to this post.')
  }

  const { data, error } = await supabase.from('comments')
    .insert({ post_id, parent_comment_id: parent_comment_id ?? null, user_id: req.user!.id, content: content.trim() })
    .select('id, post_id, parent_comment_id, content, created_at, is_deleted')
    .single()
  if (error) throw new AppError(500, 'Could not create the comment.')
  res.status(201).json(serializeComment({ ...data, depth: 0, is_mine: true, can_delete: true }))
})

commentsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  if (!UUID.test(id)) throw new AppError(400, 'Invalid comment ID.')
  const { data: comment, error: findError } = await supabase
    .from('comments')
    .select('id, user_id, post_id, is_deleted, posts!inner(user_id)')
    .eq('id', id)
    .maybeSingle()
  if (findError || !comment || comment.is_deleted) throw new AppError(404, 'Comment not found.')
  const linkedPost = Array.isArray(comment.posts) ? comment.posts[0] : comment.posts
  if (!linkedPost?.user_id) throw new AppError(404, 'Post not found.')
  const postOwnerId = linkedPost.user_id
  const isAdmin = req.profile!.is_admin
  if (comment.user_id !== req.user!.id && postOwnerId !== req.user!.id && !isAdmin) throw new AppError(403, 'You cannot delete this comment.')

  const { error: deleteError } = await supabase.from('comments').update({ is_deleted: true }).eq('id', id)
  if (deleteError) throw new AppError(500, 'Could not delete the comment.')
  if (isAdmin) {
    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 2_000) || null : null
    const { error: logError } = await supabase.from('moderation_log').insert({ admin_id: req.user!.id, action: 'delete_comment', target_type: 'comment', target_id: id, reason })
    if (logError) throw new AppError(500, 'Comment was removed but the moderation log could not be written.')
  }
  res.status(204).end()
})
