import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

async function loadProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, batch, is_admin, is_banned, current_streak, longest_streak, last_post_date, created_at')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const setAuthState = useCallback(async (nextSession) => {
    setSession(nextSession)
    if (!nextSession?.user) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setProfile(await loadProfile(nextSession.user.id))
    } catch (error) {
      console.error('Could not load your profile:', error.message)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Keep the callback synchronous; profile loading happens independently.
      void setAuthState(nextSession)
    })
    return () => subscription.unsubscribe()
  }, [setAuthState])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo(() => ({
    user: session?.user ?? null, session, profile, loading, signOut,
  }), [session, profile, loading, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}
