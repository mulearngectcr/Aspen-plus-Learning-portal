import { Link } from 'react-router-dom'

function LeafMark() {
  return <span aria-hidden="true" className="grid size-11 place-items-center rounded-2xl bg-[#16834A] text-xl text-white shadow-[0_8px_18px_rgba(22,131,74,0.24)]">♧</span>
}

export function AuthLayout({ title, subtitle, children, footer }) {
  return <main className="relative min-h-screen overflow-hidden bg-[#F6FAF7] px-4 py-6 sm:px-6 lg:grid lg:place-items-center lg:p-10">
    <div aria-hidden="true" className="absolute -left-24 -top-28 size-80 rounded-full bg-[#DDF2E4] blur-3xl" />
    <div aria-hidden="true" className="absolute -bottom-28 right-0 size-96 rounded-full bg-[#E8F5E9] blur-3xl" />
    <section className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#D6E5D9] bg-white shadow-[0_24px_80px_rgba(24,69,42,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative overflow-hidden bg-[#137B45] p-7 text-white sm:p-10 lg:min-h-[660px]">
        <div aria-hidden="true" className="absolute -right-20 -top-20 size-64 rounded-full border-[26px] border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-20 -left-20 size-72 rounded-full bg-[#0B6235]" />
        <div className="relative"><div className="flex items-center gap-3"><LeafMark /><span className="font-semibold tracking-tight">Aspen Plus<br /><span className="text-emerald-100">Learning Portal</span></span></div><div className="mt-12 max-w-sm"><p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-100">Learn together</p><h2 className="mt-4 font-serif text-4xl leading-tight">Track the work.<br />Grow the habit.</h2><p className="mt-5 max-w-xs text-sm leading-6 text-emerald-50/90">A calm, private place for daily progress, streaks, and shared momentum.</p></div><div className="mt-10 space-y-3"><div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="text-sm font-semibold">✓ Your progress is private</p><p className="mt-1 text-xs leading-5 text-emerald-50/80">Posts stay anonymous while your streak stays yours.</p></div><div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="text-sm font-semibold">✓ Small steps count</p><p className="mt-1 text-xs leading-5 text-emerald-50/80">Show up today and build something steady.</p></div></div></div>
      </aside>
      <section className="p-7 sm:p-10 lg:p-12"><Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#137B45]"><span className="grid size-7 place-items-center rounded-lg bg-[#EAF6ED]">♧</span> Aspen Plus</Link><div className="mt-10 max-w-md"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16834A]">Student space</p><h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#13251D] sm:text-4xl">{title}</h1><p className="mt-3 text-sm leading-6 text-[#627468]">{subtitle}</p><div className="mt-7">{children}</div>{footer && <div className="mt-7 border-t border-[#E1ECE3] pt-5 text-center text-sm text-[#627468]">{footer}</div>}</div></section>
    </section>
  </main>
}
