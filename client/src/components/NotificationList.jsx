import { useNavigate } from 'react-router-dom'
import { api } from '../lib/apiClient'

export function NotificationList({ notifications, onChanged, onClose }) {
  const navigate = useNavigate()
  async function open(notification) {
    try {
      if (!notification.is_read) await api.patch(`/notifications/${notification.id}/read`, {})
      onChanged()
      if (notification.target_type === 'post' && notification.target_id) navigate(`/post/${notification.target_id}`)
    } finally { onClose() }
  }
  if (!notifications.length) return <p className="p-5 text-center text-sm text-stone-600">No notifications yet.</p>
  return <ul className="m-0 max-h-96 overflow-y-auto p-0">{notifications.map((notification) => <li key={notification.id} className="list-none border-b border-[#E4E0D6] last:border-0"><button onClick={() => void open(notification)} className={`w-full px-4 py-3 text-left text-sm ${notification.is_read ? 'text-stone-600' : 'bg-[#E4EDE7] text-[#1A1D1B]'}`}><span className="block leading-5">{notification.message}</span><time className="mt-1 block font-mono text-[11px] text-stone-500">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(notification.created_at))}</time></button></li>)}</ul>
}
