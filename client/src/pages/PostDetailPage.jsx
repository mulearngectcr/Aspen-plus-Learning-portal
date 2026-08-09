import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CommentComposer } from '../components/CommentComposer'
import { CommentThread } from '../components/CommentThread'
import { api } from '../lib/apiClient'
import { useRealtimeEvent } from '../realtime/RealtimeContext'

export default function PostDetailPage() {
  const { id } = useParams()
  const [comments, setComments] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const loadComments = useCallback(async () => { try { const response = await api.get(`/posts/${id}/comments`); setComments(response.comments); setError('') } catch (issue) { setError(issue.message) } finally { setLoading(false) } }, [id])
  useEffect(() => { void loadComments() }, [loadComments])
  useRealtimeEvent((event) => { if (event.type === 'comment_created' && event.post_id === id) void loadComments() })
  return <main className="min-h-screen bg-[#FAF8F3] px-4 py-8"><section className="mx-auto max-w-3xl"><Link className="text-sm font-medium text-[#14532D] underline" to="/">Back to feed</Link><h1 className="mt-6 font-serif text-3xl text-[#1A1D1B]">Post discussion</h1><p className="mt-2 text-sm text-stone-600">Comments are anonymous. This page refreshes quietly while you read.</p><CommentComposer postId={id} onCreated={loadComments} />{loading ? <div className="space-y-5 py-8">{[1, 2].map((key) => <div key={key} className="h-16 animate-pulse rounded bg-stone-200" />)}</div> : error ? <p className="error mt-6">{error} <button className="underline" onClick={() => void loadComments()}>Try again</button></p> : <CommentThread comments={comments} postId={id} onRefresh={loadComments} />}</section></main>
}
