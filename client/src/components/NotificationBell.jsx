import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/apiClient'
import { NotificationList } from './NotificationList'

export function NotificationBell() {
  const [open, setOpen] = useState(false); const [notifications, setNotifications] = useState([]); const [error, setError] = useState('')
  const load = useCallback(async () => { try { const response = await api.get('/notifications?limit=50'); setNotifications(response.notifications); setError('') } catch (issue) { setError(issue.message) } }, [])
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 9000); return () => window.clearInterval(timer) }, [load])
  const unread = notifications.filter((notification) => !notification.is_read).length
  async function markAll() { try { await api.patch('/notifications/read-all', {}); await load() } catch (issue) { setError(issue.message) } }
  return <div className="relative"><button aria-label="Notifications" onClick={() => setOpen(!open)} className="relative grid size-9 place-items-center rounded-full text-[#14532D] hover:bg-[#E4EDE7]"><span aria-hidden="true">♧</span>{unread > 0 && <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-[#9B3B3B] px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}</button>{open && <section className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-[#E4E0D6] bg-white shadow-lg"><header className="flex items-center justify-between border-b border-[#E4E0D6] px-4 py-3"><h2 className="font-serif text-lg">Notifications</h2>{unread > 0 && <button onClick={() => void markAll()} className="text-xs font-medium text-[#14532D] underline">Mark all read</button>}</header>{error ? <p className="error m-3">{error}</p> : <NotificationList notifications={notifications} onChanged={load} onClose={() => setOpen(false)} />}</section>}</div>
}
