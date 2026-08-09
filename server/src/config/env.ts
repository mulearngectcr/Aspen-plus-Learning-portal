import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function positiveInteger(name: string, fallback: number): number {
  const raw = process.env[name]?.trim()
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error(`${name} must be an integer between 1 and 100.`)
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '3001', 10),
  clientOrigin: required('CLIENT_ORIGIN'),
  supabaseUrl: required('SUPABASE_URL'),
  // Deliberately server-only: never copy this to a VITE_* variable or client/.env.
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  bootcampStartDate: process.env.BOOTCAMP_START_DATE?.trim() || null,
  groupCount: positiveInteger('GROUP', 10),
} as const

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
  throw new Error('PORT must be a valid TCP port number.')
}
