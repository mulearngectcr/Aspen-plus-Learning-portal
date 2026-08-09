import { ChartNoAxesCombined, Flame, House, LogOut, Trophy, UsersRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { NotificationBell } from './NotificationBell'

const navigation = [
  { to: '/', label: 'Check-in', icon: House, end: true },
  { to: '/community', label: 'Community', icon: UsersRound },
  { to: '/leaderboard', label: 'Board', icon: Trophy },
  { to: '/me', label: 'Progress', icon: ChartNoAxesCombined },
]

export function AppShell() {
  const { signOut } = useAuth()
  return <main className="min-h-screen bg-[#F6FAF7] pb-24"><header className="sticky top-0 z-20 border-b border-[#D6E5D9] bg-[#F6FAF7]/95 px-4 py-3 backdrop-blur"><div className="mx-auto flex max-w-3xl items-center justify-between"><NavLink to="/" className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-[#16834A] text-white"><Flame size={19} /></span><span className="text-sm font-bold leading-4 text-[#137B45]">Aspen Plus<br />Learning Portal</span></NavLink><div className="flex items-center gap-2"><NotificationBell /><button onClick={() => void signOut()} className="grid size-9 place-items-center rounded-full text-[#627468] hover:bg-white hover:text-[#137B45]" aria-label="Sign out"><LogOut size={18} /></button></div></div></header><Outlet /><nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-[#D6E5D9] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur"><div className="mx-auto grid max-w-lg grid-cols-4">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition ${isActive ? 'text-[#137B45]' : 'text-[#829188]'}`}>{({ isActive }) => <><Icon size={20} strokeWidth={isActive ? 2.5 : 2} /><span>{label}</span></>}</NavLink>)}</div></nav></main>
}
