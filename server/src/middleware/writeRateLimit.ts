import rateLimit from 'express-rate-limit'

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export const writeRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => !WRITE_METHODS.has(req.method),
  message: { error: 'Too many write requests. Please try again shortly.' },
})
