import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/apiClient'
import { AnonymousMark } from './CreatePostForm'

function PostCard({ post, onChange, onDelete }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(post.created_at))
  async function toggleLike() { setBusy(true); setError(''); try { if (post.liked_by_me) await api.delete(`/likes/post/${post.id}`); else await api.post('/likes', { target_type: 'post', target_id: post.id }); onChange({ ...post, liked_by_me: !post.liked_by_me, like_count: post.like_count + (post.liked_by_me ? -1 : 1) }) } catch (issue) { setError(issue.message) } finally { setBusy(false) } }
  async function removePost() { if (!window.confirm('Delete this post?')) return; setBusy(true); setError(''); try { await api.delete(`/posts/${post.id}`); onDelete(post.id) } catch (issue) { setError(issue.message) } finally { setBusy(false) } }
  return <article className="border-b border-[#E4E0D6] py-6"><div className="flex gap-3"><AnonymousMark /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><p className="text-sm font-medium">Anonymous</p><time className="shrink-0 font-mono text-xs text-stone-500">{date}</time></div><p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-[#1A1D1B]">{post.content}</p>{(post.image_url_1 || post.image_url_2) && <div className={`mt-4 grid gap-2 ${post.image_url_2 ? 'grid-cols-2' : 'grid-cols-1'}`}>{[post.image_url_1, post.image_url_2].filter(Boolean).map((url) => <img key={url} src={url} alt="Post attachment" loading="lazy" className="aspect-square w-full rounded-lg border border-[#E4E0D6] object-cover" />)}</div>}<div className="mt-4 flex items-center gap-5 text-sm"><button disabled={busy} onClick={() => void toggleLike()} className={`font-medium ${post.liked_by_me ? 'text-[#9B3B3B]' : 'text-stone-600'}`}>{post.liked_by_me ? '♥' : '♡'} {post.like_count}</button><Link className="text-stone-600 hover:text-[#14532D]" to={`/post/${post.id}`}>Comments {post.comment_count}</Link>{post.is_mine && <button disabled={busy} onClick={() => void removePost()} className="ml-auto text-[#9B3B3B] underline">Delete</button>}</div>{error && <p role="alert" className="error mt-3">{error}</p>}</div></div></article>
}

function FeedSkeleton() { return <div className="space-y-7 py-6">{[1, 2, 3].map((key) => <div key={key} className="animate-pulse border-b border-[#E4E0D6] pb-7"><div className="h-4 w-24 rounded bg-stone-200" /><div className="mt-4 h-3 w-full rounded bg-stone-200" /><div className="mt-2 h-3 w-4/5 rounded bg-stone-200" /></div>)}</div> }

export function Feed({ newPost }) {
  const [posts, setPosts] = useState([]); const [cursor, setCursor] = useState(null); const [loading, setLoading] = useState(true); const [loadingMore, setLoadingMore] = useState(false); const [error, setError] = useState(''); const sentinel = useRef(null)
  const load = useCallback(async (reset = false) => { if (loadingMore) return; reset ? setLoading(true) : setLoadingMore(true); setError(''); try { const activeCursor = reset ? null : cursor; const response = await api.get(`/feed?limit=12${activeCursor ? `&cursor=${encodeURIComponent(activeCursor)}` : ''}`); setPosts((current) => reset ? response.posts : [...current, ...response.posts]); setCursor(response.next_cursor) } catch (issue) { setError(issue.message) } finally { setLoading(false); setLoadingMore(false) } }, [cursor, loadingMore])
  useEffect(() => { void load(true) }, [])
  useEffect(() => { const timer = window.setInterval(() => void load(true), 10000); return () => window.clearInterval(timer) }, [load])
  useEffect(() => { if (newPost) setPosts((current) => [newPost, ...current.filter((post) => post.id !== newPost.id)]) }, [newPost])
  useEffect(() => { const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && cursor && !loadingMore) void load() }, { rootMargin: '300px' }); if (sentinel.current) observer.observe(sentinel.current); return () => observer.disconnect() }, [cursor, loadingMore, load])
  if (loading) return <FeedSkeleton />
  if (error && !posts.length) return <div className="py-10 text-sm text-[#9B3B3B]">Could not load the feed. <button className="underline" onClick={() => void load(true)}>Try again</button></div>
  if (!posts.length) return <div className="py-12 text-center text-sm text-stone-600">No posts yet today — be the first to share what you studied.</div>
  return <section>{posts.map((post) => <PostCard key={post.id} post={post} onChange={(next) => setPosts((current) => current.map((item) => item.id === next.id ? next : item))} onDelete={(id) => setPosts((current) => current.filter((post) => post.id !== id))} />)}{error && <p className="error mt-4">{error}</p>}<div ref={sentinel} className="py-5 text-center text-sm text-stone-500">{loadingMore ? 'Loading more…' : cursor ? 'Keep scrolling' : 'You’re all caught up.'}</div></section>
}
