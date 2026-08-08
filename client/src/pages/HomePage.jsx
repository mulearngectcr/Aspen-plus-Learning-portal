import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { CreatePostForm } from '../components/CreatePostForm'
import { DarkModeToggle } from '../components/DarkModeToggle'
import { Feed } from '../components/Feed'
import { Leaderboard } from '../components/Leaderboard'
import { NotificationBell } from '../components/NotificationBell'

export default function HomePage() {
  const { signOut } = useAuth()
  const [newPost, setNewPost] = useState(null)

  return <main className="min-h-screen bg-[#FAF8F3] px-4 py-7 dark:bg-slate-950 sm:px-8">
    <header className="mx-auto flex max-w-3xl items-center justify-between border-b border-[#E4E0D6] pb-5 dark:border-slate-700">
      <span className="font-serif text-xl font-semibold text-[#14532D] dark:text-emerald-300">Chem-E Bootcamp</span>
      <div className="flex items-center gap-3"><Link className="text-sm font-medium text-[#14532D] underline dark:text-emerald-300" to="/me">Streak</Link><DarkModeToggle /><NotificationBell /><button className="text-sm font-medium text-stone-600 underline dark:text-slate-300" onClick={() => void signOut()}>Sign out</button></div>
    </header>
    <section className="mx-auto max-w-3xl py-8">
      <p className="font-mono text-xs uppercase tracking-wider text-[#C08A2E]">Daily study log</p>
      <h1 className="mt-2 font-serif text-3xl text-[#1A1D1B] dark:text-slate-100">Today’s work</h1>
      <p className="mt-2 text-sm text-stone-600 dark:text-slate-300">Share the work. Keep the person behind it private.</p>
      <CreatePostForm onCreated={setNewPost} />
      <Feed newPost={newPost} />
      <Leaderboard />
    </section>
  </main>
}
