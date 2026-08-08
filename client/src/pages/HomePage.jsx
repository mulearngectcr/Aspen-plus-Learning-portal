import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { CreatePostForm } from '../components/CreatePostForm'
import { Feed } from '../components/Feed'
import { Leaderboard } from '../components/Leaderboard'
import { NotificationBell } from '../components/NotificationBell'

export default function HomePage() {
  const { signOut } = useAuth()
  const [newPost, setNewPost] = useState(null)

  return <main className="min-h-screen bg-[#F6FAF7] px-4 py-5 sm:px-8"><header className="mx-auto flex max-w-3xl items-center justify-between border-b border-[#D6E5D9] pb-5"><Link to="/" className="flex items-center gap-2.5"><span className="grid size-10 place-items-center rounded-xl bg-[#16834A] text-lg text-white shadow-sm">♧</span><span className="text-sm font-bold leading-4 text-[#137B45]">Aspen Plus<br />Learning Portal</span></Link><div className="flex items-center gap-3"><Link className="rounded-full bg-[#E8F5E9] px-3 py-1.5 text-sm font-bold text-[#137B45]" to="/me">My progress</Link><NotificationBell /><button className="text-sm font-semibold text-[#627468] hover:text-[#137B45]" onClick={() => void signOut()}>Sign out</button></div></header><section className="mx-auto max-w-3xl py-8"><div className="rounded-2xl border border-[#CFE6D5] bg-[#ECF7EE] p-4 sm:flex sm:items-center sm:justify-between"><div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#16834A]">♧</span><div><p className="font-semibold text-[#1E5D36]">Your identity stays private.</p><p className="mt-0.5 text-sm text-[#537060]">Share your study wins and keep the focus on learning.</p></div></div><Link className="mt-3 inline-block text-sm font-bold text-[#137B45] underline sm:mt-0" to="/me">View streak</Link></div><p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#16834A]">Daily check-in</p><h1 className="mt-2 font-serif text-3xl text-[#13251D] sm:text-4xl">What moved forward today?</h1><p className="mt-2 text-sm leading-6 text-[#627468]">A few honest lines are enough. Consistency is the real win.</p><CreatePostForm onCreated={setNewPost} /><div className="mt-7"><div className="flex items-end justify-between"><div><h2 className="font-serif text-2xl text-[#13251D]">Community feed</h2><p className="mt-1 text-sm text-[#627468]">Anonymous progress from your peers.</p></div><span className="rounded-full bg-[#EAF6ED] px-3 py-1 text-xs font-bold text-[#137B45]">Anonymous</span></div><Feed newPost={newPost} /></div><Leaderboard /></section></main>
}
