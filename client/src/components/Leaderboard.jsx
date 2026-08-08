import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/apiClient'

export function Leaderboard() {
  const [data, setData] = useState(null); const [error, setError] = useState('')
  const load = useCallback(async () => { try { setData(await api.get('/leaderboard')); setError('') } catch (issue) { setError(issue.message) } }, [])
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 60_000); return () => window.clearInterval(timer) }, [load])
  if (error) return <p className="mt-6 text-sm text-stone-600 dark:text-slate-400">Weekly ranking is unavailable right now.</p>
  if (!data) return <div className="mt-6 h-28 animate-pulse rounded-xl bg-stone-200 dark:bg-slate-800" />
  return <section className="mt-8 rounded-xl border border-[#E4E0D6] bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-wider text-[#C08A2E]">This week</p><h2 className="mt-1 font-serif text-xl">Streak board</h2></div><p className="text-right text-sm text-stone-600 dark:text-slate-300">{data.your_rank ? <>You’re <b>#{data.your_rank}</b></> : 'Post this week to join'}</p></div><p className="mt-2 text-xs text-stone-500 dark:text-slate-400">Ranks show streak lengths only — never names.</p><ol className="mt-4 space-y-2">{data.leaderboard.map((entry) => <li key={`${entry.rank}-${entry.streak}`} className="flex items-center justify-between rounded-lg bg-[#FAF8F3] px-3 py-2 text-sm dark:bg-slate-800"><span className="font-mono text-stone-500 dark:text-slate-400">#{entry.rank}</span><span className="font-medium text-[#14532D] dark:text-emerald-300">{entry.streak} day{entry.streak === 1 ? '' : 's'}</span></li>)}</ol>{!data.leaderboard.length && <p className="py-4 text-sm text-stone-600 dark:text-slate-300">No one has posted this week yet.</p>}</section>
}
