import { useState } from 'react'
import { api } from '../lib/apiClient'

const MAX_CONTENT = 1000

export function CommentComposer({ postId, parentCommentId = null, onCreated, onCancel }) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault(); if (!content.trim()) return
    setSubmitting(true); setError('')
    try { await api.post('/comments', { post_id: postId, parent_comment_id: parentCommentId, content: content.trim() }); setContent(''); onCreated() } catch (issue) { setError(issue.message) } finally { setSubmitting(false) }
  }
  return <form onSubmit={submit} className="mt-3"><textarea value={content} maxLength={MAX_CONTENT} onChange={(event) => setContent(event.target.value)} required placeholder={parentCommentId ? 'Write a reply…' : 'Add an anonymous comment…'} className="min-h-20 w-full resize-y rounded-lg border border-[#E4E0D6] bg-white p-3 text-sm leading-6 outline-none focus:border-[#14532D] focus:ring-2 focus:ring-[#E4EDE7]" /><div className="mt-2 flex items-center justify-between gap-3"><span className="font-mono text-xs text-stone-500">{content.length}/{MAX_CONTENT}</span><span className="flex gap-3">{onCancel && <button type="button" onClick={onCancel} className="text-sm text-stone-600 underline">Cancel</button>}<button disabled={submitting || !content.trim()} className="primary-button py-2">{submitting ? 'Posting…' : parentCommentId ? 'Reply' : 'Comment'}</button></span></div>{error && <p role="alert" className="error mt-2">{error}</p>}</form>
}
