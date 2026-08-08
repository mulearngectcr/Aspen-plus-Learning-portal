import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { requireAdmin } from './middleware/requireAdmin.js'
import { verifyAuth } from './middleware/verifyAuth.js'
import { writeRateLimit } from './middleware/writeRateLimit.js'
import { commentsRouter } from './routes/comments.js'
import { adminRouter } from './routes/admin.js'
import { feedRouter } from './routes/feed.js'
import { healthRouter } from './routes/health.js'
import { likesRouter } from './routes/likes.js'
import { leaderboardRouter } from './routes/leaderboard.js'
import { meRouter } from './routes/me.js'
import { notificationsRouter } from './routes/notifications.js'
import { postsRouter } from './routes/posts.js'

export const app = express()

app.use(cors({ origin: env.clientOrigin, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Authorization', 'Content-Type'] }))
app.use(express.json({ limit: '1mb' }))

app.get('/ping', (_req, res) => res.status(200).send('pong'))
app.use('/api/health', healthRouter)
app.use('/api/feed', verifyAuth, feedRouter)
app.use('/api/posts', verifyAuth, writeRateLimit, postsRouter)
app.use('/api/comments', verifyAuth, writeRateLimit, commentsRouter)
app.use('/api/likes', verifyAuth, writeRateLimit, likesRouter)
app.use('/api/notifications', verifyAuth, notificationsRouter)
app.use('/api/me', verifyAuth, meRouter)
app.use('/api/leaderboard', verifyAuth, leaderboardRouter)

app.use('/api/admin', verifyAuth, requireAdmin, adminRouter)

app.use(notFound)
app.use(errorHandler)
