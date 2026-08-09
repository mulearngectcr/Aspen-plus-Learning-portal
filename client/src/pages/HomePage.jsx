import { ArrowRight, Flame, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreatePostForm } from '../components/CreatePostForm'
import { api } from '../lib/apiClient'

export default function HomePage() {
  const [progress, setProgress] = useState(null); const [error, setError] = useState('')
  const loadProgress = useCallback(async () => { try { const response = await api.get('/me'); setProgress(response); setError('') } catch (issue) { setError(issue.message) } }, [])
  useEffect(() => { void loadProgress() }, [loadProgress])
  return <section className="mx-auto max-w-3xl px-4 py-7"><div className="rounded-2xl border border-[#CFE6D5] bg-[#ECF7EE] p-5"><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#16834A]"><ShieldCheck size={21} /></span><div><p className="font-semibold text-[#1E5D36]">Your identity stays private.</p><p className="mt-1 text-sm leading-5 text-[#537060]">Your check-ins are anonymous to everyone else.</p></div></div></div><section className="mt-6 rounded-2xl border border-[#F0D898] bg-[#FFF9E9] p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B77A1B]">Current streak</p><p className="mt-2 flex items-center gap-2 font-mono text-4xl font-bold text-[#17633A]"><Flame className="fill-[#F39A3E] text-[#F39A3E]" size={31} />{progress?.current_streak ?? '—'}</p><p className="mt-2 text-sm text-[#6B6551]">{progress ? progress.current_streak ? 'Keep the rhythm going today.' : 'Your next check-in starts a new run.' : 'Loading your progress…'}</p></div><Link to="/me" className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#17633A] shadow-sm">Details <ArrowRight size={16} /></Link></div></section><div className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16834A]">Daily check-in</p><h1 className="mt-2 font-serif text-3xl text-[#13251D] sm:text-4xl">What moved forward today?</h1><p className="mt-2 text-sm leading-6 text-[#627468]">Share a small win, a tough concept, or a lesson from your work.</p><CreatePostForm onCreated={() => void loadProgress()} />{error && <p className="error mt-4">{error}</p>}</div></section>
}
