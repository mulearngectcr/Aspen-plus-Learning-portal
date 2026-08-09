import { Router } from 'express'
import { addStreamClient, startRealtimeBridge } from '../lib/realtimeBridge.js'

export const streamRouter = Router()

streamRouter.get('/', (req, res) => {
  startRealtimeBridge()
  res.status(200).set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.flushHeaders()
  res.write(': connected\n\n')
  const remove = addStreamClient(req.user!.id, res)
  const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 25_000)
  req.on('close', () => { clearInterval(heartbeat); remove() })
})
