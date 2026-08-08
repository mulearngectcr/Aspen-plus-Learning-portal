import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

// Only this server-side client receives the service-role credential.
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
})
