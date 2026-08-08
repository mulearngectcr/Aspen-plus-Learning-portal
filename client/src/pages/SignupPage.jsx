import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AuthLayout } from '../components/AuthLayout'

const COLLEGE_DOMAIN = '@gecthrissur.ac.in'

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function submit(event) {
    event.preventDefault(); setError(''); setMessage('')
    if (!form.email.trim().toLowerCase().endsWith(COLLEGE_DOMAIN)) return setError(`Use your ${COLLEGE_DOMAIN} college email.`)
    setSubmitting(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(), password: form.password,
      options: { emailRedirectTo: `${window.location.origin}/login?verified=1`, data: { full_name: form.fullName.trim(), username: form.username.trim() } },
    })
    // A verified login is required even if email confirmation was misconfigured.
    if (data.session) await supabase.auth.signOut()
    setSubmitting(false)
    if (signUpError) return setError(signUpError.message)
    setMessage('Check your college inbox and verify your email before logging in.')
  }

  return <AuthLayout title="Join the bootcamp" subtitle="Use your GEC Thrissur college email." footer={<>Already have an account? <Link className="font-medium text-[#14532D]" to="/login">Log in</Link></>}>
    <form onSubmit={submit} className="space-y-4">
      <label>Full name<input required value={form.fullName} onChange={change('fullName')} /></label>
      <label>Username<input required minLength="3" value={form.username} onChange={change('username')} /></label>
      <label>College email<input required type="email" placeholder={`you${COLLEGE_DOMAIN}`} value={form.email} onChange={change('email')} /></label>
      <label>Password<input required type="password" minLength="6" value={form.password} onChange={change('password')} /></label>
      {error && <p role="alert" className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <button className="primary-button w-full" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
    </form>
  </AuthLayout>
}
