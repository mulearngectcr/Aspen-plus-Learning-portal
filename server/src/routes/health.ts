import { Router } from 'express'
import { env } from '../config/env.js'

export const healthRouter = Router()
healthRouter.get('/', (_req, res) => res.status(200).json({ status: 'ok', group_count: env.groupCount }))
