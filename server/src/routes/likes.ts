import { Router } from 'express'
import { AppError } from '../lib/AppError.js'
import { supabase } from '../lib/supabase.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const targetTable = { post: 'posts', comment: 'comments' } as const

export const likesRouter = Router()

likesRouter.post('/', async (req, res) => {
  const { target_type, target_id } = req.body ?? {}
  if (!(target_type in targetTable) || typeof target_id !== 'string' || !UUID.test(target_id)) throw new AppError(400, 'Invalid like target.')
  const { data: target, error: targetError } = await supabase.from(targetTable[target_type as keyof typeof targetTable]).select('id, is_deleted').eq('id', target_id).maybeSingle()
  if (targetError || !target || target.is_deleted) throw new AppError(404, 'Like target not found.')

  const { error } = await supabase.from('likes').insert({ user_id: req.user!.id, target_type, target_id })
  if (error && error.code !== '23505') throw new AppError(500, 'Could not add the like.')
  res.status(error ? 200 : 201).json({ liked: true })
})

likesRouter.delete('/:targetType/:targetId', async (req, res) => {
  const { targetType, targetId } = req.params
  if (!(targetType in targetTable) || !UUID.test(targetId)) throw new AppError(400, 'Invalid like target.')
  const { error } = await supabase.from('likes').delete().eq('user_id', req.user!.id).eq('target_type', targetType).eq('target_id', targetId)
  if (error) throw new AppError(500, 'Could not remove the like.')
  res.json({ liked: false })
})
