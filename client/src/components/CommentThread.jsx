import { useState } from 'react'
import { api } from '../lib/apiClient'
import { AnonymousMark } from './CreatePostForm'
import { CommentComposer } from './CommentComposer'

function CommentNode({ comment, postId, onRefresh }) {
  const [collapsed, setCollapsed] = useState(false); const [replying, setReplying] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const indent = Math.min(comment.depth, 5) * 12
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(comment.created_at))
  async function remove() { if (!window.confirm('Delete this comment?')) return; setBusy(true); setError(''); try { await api.delete(`/comments/${comment.id}`); onRefresh() } catch (issue) { setError(issue.message) } finally { setBusy(false) } }
  return <li style={{ marginLeft: `${indent}px` }} className="mt-5 list-none"><div className="flex gap-3"><AnonymousMark /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">Anonymous</p><time className="font-mono text-xs text-stone-500">{date}</time></div>{comment.is_deleted ? <p className="mt-2 text-sm italic text-stone-500">Comment removed.</p> : <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{comment.content}</p>}<div className="mt-2 flex items-center gap-4 text-xs"><button onClick={() => setCollapsed(!collapsed)} className="text-stone-600 underline">{collapsed ? '+' : '−'} {comment.replies.length ? `${comment.replies.length} repl${comment.replies.length === 1 ? 'y' : 'ies'}` : 'thread'}</button>{!comment.is_deleted && <button onClick={() => setReplying(!replying)} className="text-[#14532D] underline">Reply</button>}{comment.can_delete && <button disabled={busy} onClick={() => void remove()} className="text-[#9B3B3B] underline">Delete</button>}</div>{error && <p role="alert" className="error mt-2">{error}</p>}{replying && <CommentComposer postId={postId} parentCommentId={comment.id} onCreated={() => { setReplying(false); onRefresh() }} onCancel={() => setReplying(false)} />}{!collapsed && comment.replies.length > 0 && <ul className="m-0 p-0">{comment.replies.map((reply) => <CommentNode key={reply.id} comment={reply} postId={postId} onRefresh={onRefresh} />)}</ul>}</div></div></li>
}

export function CommentThread({ comments, postId, onRefresh }) {
  if (!comments.length) return <p className="py-8 text-center text-sm text-stone-600">No comments yet — start the discussion.</p>
  return <ul className="m-0 p-0">{comments.map((comment) => <CommentNode key={comment.id} comment={comment} postId={postId} onRefresh={onRefresh} />)}</ul>
}
