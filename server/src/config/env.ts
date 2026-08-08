import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
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
} as const

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
  throw new Error('PORT must be a valid TCP port number.')
}
