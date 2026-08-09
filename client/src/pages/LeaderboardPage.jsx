import { Trophy } from 'lucide-react'
import { Leaderboard } from '../components/Leaderboard'

export default function LeaderboardPage() {
  return <section className="mx-auto max-w-3xl px-4 py-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#FFF4D8] text-[#B77A1B]"><Trophy size={20} /></span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B77A1B]">Weekly momentum</p><h1 className="mt-1 font-serif text-3xl text-[#13251D]">Keep showing up.</h1></div></div><p className="mt-3 text-sm text-[#627468]">A name-free board for friendly motivation, reset every week.</p><Leaderboard /></section>
}
