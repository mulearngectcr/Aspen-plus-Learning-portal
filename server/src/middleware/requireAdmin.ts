import type { NextFunction, Request, Response } from 'express'

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.profile?.is_admin) return res.status(403).json({ error: 'Administrator access required.' })
  next()
}
