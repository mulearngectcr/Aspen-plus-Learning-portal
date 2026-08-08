import type { ErrorRequestHandler, RequestHandler } from 'express'
import { env } from '../config/env.js'
import { AppError } from '../lib/AppError.js'

export const notFound: RequestHandler = (_req, res) => res.status(404).json({ error: 'Route not found.' })

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500
  if (statusCode >= 500) console.error(error)
  res.status(statusCode).json({
    error: error instanceof AppError ? error.message : 'An unexpected server error occurred.',
    ...(env.nodeEnv !== 'production' && statusCode >= 500 ? { detail: error.message } : {}),
  })
}
