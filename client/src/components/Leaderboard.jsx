import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/apiClient'

export function Leaderboard() {
  const [data, setData] = useState(null); const [error, setError] = useState('')
  const load = useCallback(async () => { try { setData(await api.get('/leaderboard')); setError('') } catch (issue) { setError(issue.message) } }, [])
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 60_000); return () => window.clearInterval(timer) }, [load])
  if (error) return <p className="mt-6 text-sm text-[#627468]">Weekly ranking is unavailable right now.</p>
  if (!data) return <div className="mt-6 h-28 animate-pulse rounded-2xl bg-[#E7F0E9]" />
  return <section className="mt-8 rounded-2xl border border-[#D6E5D9] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16834A]">This week</p><h2 className="mt-1 font-serif text-2xl text-[#13251D]">Streak board</h2></div><p className="rounded-xl bg-[#EEF8F0] px-3 py-2 text-right text-sm text-[#17633A]">{data.your_rank ? <>You’re <b>#{data.your_rank}</b></> : 'Post this week to join'}</p></div><p className="mt-2 text-xs text-[#718277]">Ranks show streak lengths only — never names.</p><ol className="mt-4 space-y-2">{data.leaderboard.map((entry) => <li key={`${entry.rank}-${entry.streak}`} className="flex items-center justify-between rounded-xl bg-[#F6FAF7] px-4 py-3 text-sm"><span className="font-mono font-semibold text-[#6C7D72]">#{entry.rank}</span><span className="font-bold text-[#137B45]">{entry.streak} day{entry.streak === 1 ? '' : 's'}</span></li>)}</ol>{!data.leaderboard.length && <p className="py-4 text-sm text-[#627468]">No one has posted this week yet.</p>}</section>
}
