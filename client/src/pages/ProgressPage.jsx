import { Award, CheckCircle2, Flame, Heart, LockKeyhole, MessageCircle, PenLine } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/apiClient'

const QUOTES = ['Small progress compounds.', 'Consistency is quiet engineering.', "Today's work becomes tomorrow's intuition.", 'One focused session is enough to move forward.']
const DATE_FORMATTER = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Kolkata' })
const HEATMAP_WEEKS = 53
const HEATMAP_CELL = 12
const HEATMAP_GAP = 3
const HEATMAP_DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

const BADGES = [
  { slug: 'first-post', name: 'First Signal', description: 'Published your first study check-in.', icon: PenLine, gradient: 'linear-gradient(135deg, #0B7A43, #36B568 58%, #B8E05F)', glow: '#16834A', mark: '01' },
  { slug: 'first-comment', name: 'Conversation Starter', description: 'Joined the community with your first comment.', icon: MessageCircle, gradient: 'linear-gradient(135deg, #1675A6, #2DB9D1 58%, #76E1D5)', glow: '#2196B4', mark: '02' },
  { slug: 'ten-post-likes', name: 'High Five', description: 'Your posts received 10 likes in total.', icon: Heart, gradient: 'linear-gradient(135deg, #D13A62, #F06B7C 58%, #FFB169)', glow: '#E14C6C', mark: '10' },
  { slug: 'five-day-streak', name: 'Warm Up', description: 'Kept a five-day streak alive.', icon: Flame, gradient: 'linear-gradient(135deg, #F0A91E, #F36A25 58%, #E83E3E)', glow: '#ED7A22', mark: '05' },
  { slug: 'ten-day-streak', name: 'On a Roll', description: 'Built ten days of steady momentum.', icon: Flame, gradient: 'linear-gradient(135deg, #F05D28, #E83955 58%, #C72B72)', glow: '#E5474D', mark: '10' },
  { slug: 'twenty-day-streak', name: 'Momentum', description: 'Held your focus for twenty days.', icon: Flame, gradient: 'linear-gradient(135deg, #6954C7, #9A55D8 58%, #DA63C5)', glow: '#815ACF', mark: '20' },
  { slug: 'thirty-day-streak', name: 'Monthly Mastery', description: 'Completed a full month of showing up.', icon: Award, gradient: 'linear-gradient(135deg, #D89C16, #F2C94C 58%, #F6DE86)', glow: '#DCA62B', mark: '30' },
  { slug: 'sixty-day-streak', name: 'Deep Work', description: 'Maintained a sixty-day practice.', icon: Award, gradient: 'linear-gradient(135deg, #294EC2, #387BD7 58%, #65C9E7)', glow: '#3E6FCF', mark: '60' },
  { slug: 'ninety-day-streak', name: 'Unstoppable', description: 'Reached ninety days of progress.', icon: Award, gradient: 'linear-gradient(135deg, #AE39A9, #DF5394 58%, #FC8790)', glow: '#C84A9E', mark: '90' },
  { slug: 'one-twenty-day-streak', name: 'Habit Architect', description: 'Designed a 120-day learning habit.', icon: Award, gradient: 'linear-gradient(135deg, #078D88, #24B98D 58%, #A6DD59)', glow: '#169E84', mark: '120' },
  { slug: 'one-fifty-day-streak', name: 'Iron Will', description: 'Sustained 150 days of commitment.', icon: Award, gradient: 'linear-gradient(135deg, #263947, #4A6070 58%, #8396A2)', glow: '#465B68', mark: '150' },
  { slug: 'one-eighty-day-streak', name: 'Legendary', description: 'Reached an extraordinary 180-day streak.', icon: Award, gradient: 'linear-gradient(135deg, #4831A8, #5C66DB 58%, #66BDF0)', glow: '#5962CF', mark: '180' },
]

function Calendar({ entries, posts }) {
  const statuses = new Map(entries.map((entry) => [entry.date, entry.status]))
  const postCounts = new Map()
  posts.forEach((post) => postCounts.set(post.post_date, (postCounts.get(post.post_date) ?? 0) + 1))

  const weeks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(today)
    end.setDate(end.getDate() + (6 - end.getDay()))
    const start = new Date(end)
    start.setDate(end.getDate() - (HEATMAP_WEEKS * 7 - 1))
    const dates = Array.from({ length: HEATMAP_WEEKS * 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return date
    })
    return Array.from({ length: HEATMAP_WEEKS }, (_, column) => dates.slice(column * 7, column * 7 + 7))
  }, [])

  const monthLabels = useMemo(() => weeks.map((week, index) => {
    const first = week[0]
    const previous = index > 0 ? weeks[index - 1][0] : null
    if (!previous || first.getMonth() !== previous.getMonth()) {
      return first.toLocaleString(undefined, { month: 'short' })
    }
    return ''
  }), [weeks])

  const toneFor = (status, count) => {
    if (status === 'sunday_free_pass') return 'bg-[#F3C75F] ring-1 ring-[#D3A735]/30'
    if (status === 'missed') return 'bg-[#E9B9B9] ring-1 ring-[#C98787]/25'
    if (!count) return 'bg-[#DCE8DF] ring-1 ring-[#C5D6C9]'
    if (count === 1) return 'bg-[#62C67B] ring-1 ring-[#3EAA5A]'
    if (count === 2) return 'bg-[#249A4C] ring-1 ring-[#167C3A]'
    return 'bg-[#087A3D] ring-1 ring-[#05632F]'
  }

  const activityLabel = (status, count) => {
    if (count) return `${count} post${count === 1 ? '' : 's'}`
    if (status === 'sunday_free_pass') return 'Sunday free pass'
    if (status === 'missed') return 'Missed'
    return 'No posts'
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex min-w-max flex-col gap-1">
        <div className="flex pl-8" style={{ gap: HEATMAP_GAP }}>
          {monthLabels.map((label, index) => (
            <span
              key={index}
              className="truncate text-[10px] font-medium leading-none text-[#718277]"
              style={{ width: HEATMAP_CELL, height: 14 }}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex w-7 shrink-0 flex-col justify-around py-[2px] text-[10px] leading-none text-[#718277]">
            {HEATMAP_DAY_LABELS.map((label, index) => (
              <span key={index} style={{ height: HEATMAP_CELL }}>{label}</span>
            ))}
          </div>
          <div className="flex" style={{ gap: HEATMAP_GAP }}>
            {weeks.map((week, column) => (
              <div key={column} className="flex flex-col" style={{ gap: HEATMAP_GAP }}>
                {week.map((date) => {
                  const key = DATE_FORMATTER.format(date)
                  const status = statuses.get(key)
                  const storedCount = postCounts.get(key) ?? 0
                  // Calendar rows may outlive a soft-deleted post. A posted
                  // streak day must still be rendered as a contribution.
                  const count = storedCount || (status === 'posted' ? 1 : 0)
                  return (
                    <span
                      key={key}
                      title={`${key}: ${activityLabel(status, count)}`}
                      className={`rounded-[2px] transition duration-150 hover:scale-125 hover:ring-2 hover:ring-[#137B45]/35 ${toneFor(status, count)}`}
                      style={{ width: HEATMAP_CELL, height: HEATMAP_CELL }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BadgeCard({ definition, earned }) {
  const Icon = definition.icon
  return <article className={`relative overflow-hidden rounded-2xl border p-4 transition ${earned ? 'border-white/60 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md' : 'border-[#E1E8E3] bg-[#F8FAF8] opacity-70 grayscale-[0.45]'}`}>
    <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundImage: definition.gradient }} />
    <div className="flex gap-3"><div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl text-white" style={{ backgroundImage: definition.gradient, boxShadow: `0 10px 22px ${definition.glow}55` }}><span aria-hidden="true" className="absolute -right-3 -top-4 size-10 rounded-full bg-white/25" /><span aria-hidden="true" className="absolute -bottom-3 -left-3 size-7 rounded-full border-2 border-white/30" /><Icon className="relative" size={25} strokeWidth={2.5} /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="font-bold leading-5 text-[#173326]">{definition.name}</h3><span className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${earned ? 'bg-[#EAF6ED] text-[#137B45]' : 'bg-[#E9EDEA] text-[#718277]'}`}>{earned ? definition.mark : <LockKeyhole size={11} />}</span></div><p className="mt-1 text-xs leading-5 text-[#627468]">{definition.description}</p>{earned ? <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#137B45]"><CheckCircle2 size={13} /> Earned {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(earned.awarded_at))}</p> : <p className="mt-2 text-[11px] font-bold text-[#829188]">Locked collectible</p>}</div></div>
  </article>
}

function Celebration({ visible }) { return visible ? <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-12 z-30 text-center text-2xl"><span className="flame-pulse inline-block">&#128293;</span><span className="confetti-one">&#8226;</span><span className="confetti-two">&#10022;</span><span className="confetti-three">&#8226;</span></div> : null }

export default function ProgressPage() {
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [celebrate, setCelebrate] = useState(false); const [quoteIndex, setQuoteIndex] = useState(0)
  const load = useCallback(async () => { try { const response = await api.get('/me'); setData(response); setError('') } catch (issue) { setError(issue.message) } }, [])
  useEffect(() => { void load(); const quoteTimer = window.setInterval(() => setQuoteIndex((index) => (index + 1) % QUOTES.length), 7000); return () => window.clearInterval(quoteTimer) }, [load])
  useEffect(() => { if (!data) return; const key = 'chem-e-current-streak'; const previous = Number(sessionStorage.getItem(key)); if (Number.isFinite(previous) && data.current_streak > previous) { setCelebrate(true); const timer = window.setTimeout(() => setCelebrate(false), 900); return () => window.clearTimeout(timer) } sessionStorage.setItem(key, String(data.current_streak)) }, [data])
  const encouragement = useMemo(() => !data ? '' : data.current_streak >= 30 ? 'A month of showing up. That is real momentum.' : data.current_streak >= 7 ? 'A full week of steady work. Keep the signal strong.' : data.current_streak > 0 ? "You're building the habit one honest day at a time." : 'Your next study update starts a new run.', [data])
  async function removePost(id) { if (!window.confirm('Delete this post?')) return; try { await api.delete(`/posts/${id}`); await load() } catch (issue) { setError(issue.message) } }
  if (!data && !error) return <main className="grid min-h-screen place-items-center bg-[#F6FAF7] text-sm text-[#627468]">Loading your progress...</main>
  if (error && !data) return <main className="grid min-h-screen place-items-center bg-[#F6FAF7]"><p className="error">{error} <button onClick={() => void load()} className="underline">Try again</button></p></main>
  const earnedBySlug = new Map(data.badges.map((badge) => [badge.slug, badge]))
  return <main className="min-h-screen bg-[#F6FAF7] px-4 py-6"><Celebration visible={celebrate} /><section className="mx-auto max-w-3xl"><header className="flex items-center justify-between border-b border-[#D6E5D9] pb-5"><Link className="text-sm font-bold text-[#137B45] underline" to="/">&larr; Check-in</Link><span className="rounded-full bg-[#EAF6ED] px-3 py-1 text-xs font-bold text-[#137B45]">Day {data.days_in_bootcamp}</span></header><div className="mt-7 flex flex-col gap-8"><section className="rounded-2xl border border-[#CFE6D5] bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16834A]">Your current streak</p><div className="mt-3 flex items-end gap-3"><span className={`font-mono text-6xl font-bold text-[#137B45] ${celebrate ? 'flame-pulse' : ''}`}>{data.current_streak}</span><span className="pb-2 text-3xl">&#128293;</span></div><p className="mt-3 max-w-md text-sm leading-6 text-[#627468]">{encouragement}</p></div><div className="flex gap-2"><div className="rounded-xl border border-[#D6E5D9] bg-[#F7FBF8] px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#718277]">Best run</p><p className="mt-1 font-mono text-2xl font-bold text-[#137B45]">{data.longest_streak}</p></div><div className="rounded-xl border border-[#D6E5D9] bg-[#F7FBF8] px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#718277]">Posts</p><p className="mt-1 font-mono text-2xl font-bold text-[#137B45]">{data.total_post_count}</p></div></div></div><p className="mt-5 rounded-xl bg-[#EEF8F0] px-4 py-3 font-serif text-lg text-[#17633A]">&ldquo;{QUOTES[quoteIndex]}&rdquo;</p></section><section className="rounded-2xl border border-[#D6E5D9] bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="font-serif text-xl">Activity heatmap</h2><p className="mt-1 text-xs text-[#718277]">{data.total_post_count} posts across the last year. Darker green means more check-ins that day.</p></div><span className="shrink-0 rounded-lg bg-[#EEF8F0] px-2 py-1 text-[11px] font-bold text-[#137B45]">Last 12 months</span></div><div className="mt-6 px-1"><Calendar entries={data.streak_calendar} posts={data.posts} /></div><div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-[#718277]"><span>Less</span><i className="size-3 rounded-[3px] bg-[#EDF2EE]" /><i className="size-3 rounded-[3px] bg-[#8ED39F]" /><i className="size-3 rounded-[3px] bg-[#42A961]" /><i className="size-3 rounded-[3px] bg-[#087A3D]" /><span>More</span><span className="ml-2 flex items-center gap-1"><i className="size-3 rounded-[3px] bg-[#F3C75F]" /> Sunday pass</span><span className="flex items-center gap-1"><i className="size-3 rounded-[3px] bg-[#E9B9B9]" /> Missed</span></div></section><section className="rounded-2xl border border-[#D6E5D9] bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="font-serif text-2xl">Badge cabinet</h2><p className="mt-1 text-sm text-[#627468]">Private collectibles for your work and consistency.</p></div><span className="rounded-xl bg-[#EEF8F0] px-3 py-2 text-sm font-bold text-[#137B45]">{data.badges.length}/{BADGES.length}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{BADGES.map((definition) => <BadgeCard key={definition.slug} definition={definition} earned={earnedBySlug.get(definition.slug)} />)}</div></section></div><section className="mt-8 rounded-2xl border border-[#D6E5D9] bg-white p-5 shadow-sm"><h2 className="font-serif text-2xl">Your post history</h2><p className="mt-1 text-sm text-[#627468]">Only you can access this history.</p>{data.posts.length ? <div className="mt-4">{data.posts.map((post) => <article key={post.id} className="border-b border-[#E1ECE3] py-5 last:border-0"><div className="flex items-start justify-between gap-4"><time className="text-xs text-[#718277]">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(post.created_at))}</time><button onClick={() => void removePost(post.id)} className="text-xs font-semibold text-[#A74545] underline">Delete</button></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{post.content}</p>{(post.image_url_1 || post.image_url_2) && <div className="mt-3 grid grid-cols-2 gap-2">{[post.image_url_1, post.image_url_2].filter(Boolean).map((url) => <img key={url} src={url} alt="Your post attachment" className="aspect-square rounded-xl object-cover" />)}</div>}</article>)}</div> : <p className="py-8 text-sm text-[#627468]">No posts yet. Your next study update starts the record.</p>}</section></section></main>
}
