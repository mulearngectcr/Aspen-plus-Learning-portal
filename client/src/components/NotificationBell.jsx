import { Bell } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/apiClient'
import { useRealtimeEvent } from '../realtime/RealtimeContext'
import { NotificationList } from './NotificationList'

export function NotificationBell() {
  const [open, setOpen] = useState(false); const [notifications, setNotifications] = useState([]); const [error, setError] = useState('')
  const load = useCallback(async () => { try { const response = await api.get('/notifications?limit=50'); setNotifications(response.notifications); setError('') } catch (issue) { setError(issue.message) } }, [])
  useEffect(() => { void load() }, [load])
  useRealtimeEvent((event) => { if (event.type === 'notification_created') void load() })
  const unread = notifications.filter((notification) => !notification.is_read).length
  async function markAll() { try { await api.patch('/notifications/read-all', {}); await load() } catch (issue) { setError(issue.message) } }
  return <div className="relative"><button aria-label="Notifications" onClick={() => setOpen(!open)} className="relative grid size-9 place-items-center rounded-full text-[#137B45] hover:bg-white"><Bell size={20} strokeWidth={2.2} />{unread > 0 && <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-[#C64E4E] px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}</button>{open && <section className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-[#D6E5D9] bg-white shadow-xl"><header className="flex items-center justify-between border-b border-[#E1ECE3] px-4 py-3"><h2 className="font-serif text-lg text-[#13251D]">Notifications</h2>{unread > 0 && <button onClick={() => void markAll()} className="text-xs font-bold text-[#137B45] underline">Mark all read</button>}</header>{error ? <p className="error m-3">{error}</p> : <NotificationList notifications={notifications} onChanged={load} onClose={() => setOpen(false)} />}</section>}</div>
}
