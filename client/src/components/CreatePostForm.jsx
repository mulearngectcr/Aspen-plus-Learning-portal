import { useRef, useState } from 'react'
import { api } from '../lib/apiClient'
import { supabase } from '../lib/supabase'

const MAX_CONTENT = 3000

function randomStoragePath(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100) || 'image'
  return `${crypto.randomUUID()}/${safeName}`
}

async function uploadImage(file) {
  const { default: imageCompression } = await import('browser-image-compression')
  const compressed = await imageCompression(file, { maxSizeMB: 0.9, maxWidthOrHeight: 1920, useWebWorker: true })
  const path = randomStoragePath(compressed)
  const { error } = await supabase.storage.from('post-images').upload(path, compressed, { upsert: false, contentType: compressed.type || file.type })
  if (error) throw error
  return supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl
}

export function CreatePostForm({ onCreated }) {
  const fileInput = useRef(null)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function chooseFiles(event) {
    const next = Array.from(event.target.files ?? [])
    if (next.length > 2 || next.some((file) => !file.type.startsWith('image/'))) {
      setError('Choose up to two image files.'); event.target.value = ''; return
    }
    setError(''); setFiles(next)
  }

  async function submit(event) {
    event.preventDefault()
    if (!content.trim()) return
    setError(''); setSubmitting(true)
    try {
      const urls = await Promise.all(files.map(uploadImage))
      const post = await api.post('/posts', { content: content.trim(), image_url_1: urls[0], image_url_2: urls[1] })
      setContent(''); setFiles([]); fileInput.current.value = ''
      onCreated(post)
    } catch (uploadError) { setError(uploadError.message || 'Could not post your update.') } finally { setSubmitting(false) }
  }

  return <form onSubmit={submit} className="border-b border-[#E4E0D6] py-6"><div className="flex gap-3"><AnonymousMark /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-[#1A1D1B]">Anonymous</p><textarea value={content} maxLength={MAX_CONTENT} required placeholder="What did you study today?" onChange={(event) => setContent(event.target.value)} className="mt-2 min-h-28 w-full resize-y rounded-lg border border-[#E4E0D6] bg-white p-3 text-sm leading-6 outline-none focus:border-[#14532D] focus:ring-2 focus:ring-[#E4EDE7]" /><div className="mt-2 flex items-center justify-between gap-3 text-xs font-mono text-stone-500"><span>{files.length ? `${files.length} image${files.length > 1 ? 's' : ''} ready` : 'Up to 2 images'}</span><span className={content.length > 2700 ? 'text-[#C08A2E]' : ''}>{content.length}/{MAX_CONTENT}</span></div>{error && <p role="alert" className="error mt-3">{error}</p>}<div className="mt-4 flex items-center justify-between gap-3"><label className="cursor-pointer text-sm font-medium text-[#14532D] underline">Attach images<input ref={fileInput} className="sr-only" type="file" accept="image/*" multiple onChange={chooseFiles} /></label><button className="primary-button" disabled={submitting || !content.trim()}>{submitting ? 'Posting…' : 'Post update'}</button></div></div></div></form>
}

export function AnonymousMark() {
  return <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#E4EDE7] text-[#14532D]"><svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.8"><path d="M19.5 3.5C12 4 6 8.5 6 15a5.5 5.5 0 0 0 5.5 5.5c6.5 0 9.5-6 8-17Z" /><path d="M4 20c3.5-4.5 7-7.25 12-10" /></svg></span>
}
