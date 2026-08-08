import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AuthLayout } from '../components/AuthLayout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault(); setError(''); setNotice(''); setSubmitting(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSubmitting(false)
    if (resetError) return setError(resetError.message)
    setNotice('If an account exists for that email, a reset link is on its way.')
  }

  return <AuthLayout title="Reset your password" subtitle="We’ll send a secure reset link to your college email." footer={<Link className="font-medium text-[#14532D]" to="/login">Back to login</Link>}>
    <form onSubmit={submit} className="space-y-4">
      <label>College email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      {error && <p role="alert" className="error">{error}</p>}
      {notice && <p className="success">{notice}</p>}
      <button className="primary-button w-full" disabled={submitting}>{submitting ? 'Sending…' : 'Send reset link'}</button>
    </form>
  </AuthLayout>
}
