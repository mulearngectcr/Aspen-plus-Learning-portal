import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { useAuth } from '../auth/AuthContext'
import { openSanitizedStream } from './streamClient'

const RealtimeContext = createContext(() => () => {})

export function RealtimeProvider({ children }) {
  const { user } = useAuth(); const listeners = useRef(new Set())
  const subscribe = useCallback((listener) => { listeners.current.add(listener); return () => listeners.current.delete(listener) }, [])
  useEffect(() => {
    if (!user) return
    return openSanitizedStream((event) => listeners.current.forEach((listener) => listener(event)))
  }, [user?.id])
  return <RealtimeContext.Provider value={subscribe}>{children}</RealtimeContext.Provider>
}

export function useRealtimeEvent(handler) {
  const subscribe = useContext(RealtimeContext); const handlerRef = useRef(handler)
  useEffect(() => { handlerRef.current = handler }, [handler])
  useEffect(() => subscribe((event) => handlerRef.current(event)), [subscribe])
}
