import { UsersRound } from 'lucide-react'
import { Feed } from '../components/Feed'

export default function CommunityPage() {
  return <section className="mx-auto max-w-3xl px-4 py-7"><div className="rounded-2xl border border-[#CFE6D5] bg-[#ECF7EE] p-5"><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#16834A]"><UsersRound size={20} /></span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16834A]">Community</p><h1 className="mt-1 font-serif text-2xl text-[#13251D]">Anonymous, by design.</h1><p className="mt-1 text-sm leading-6 text-[#537060]">See the work your peers are doing. Names never appear here.</p></div></div></div><Feed /></section>
}
