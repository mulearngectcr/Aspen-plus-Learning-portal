import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AuthLayout } from '../components/AuthLayout'

const COLLEGE_DOMAIN = '@gectcr.ac.in'

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function submit(event) {
    event.preventDefault(); setError('')
    if (!form.email.trim().toLowerCase().endsWith(COLLEGE_DOMAIN)) return setError(`Use your ${COLLEGE_DOMAIN} college email.`)
    setSubmitting(true); setConfirmationSent(false)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(), password: form.password,
      options: {
        data: { full_name: form.fullName.trim(), username: form.username.trim() },
        emailRedirectTo: `${window.location.origin}/login?verified=1`,
      },
    })
    setSubmitting(false)
    if (signUpError) return setError(signUpError.message)
    if (data.session) {
      await supabase.auth.signOut()
      return setError('Email verification is not enabled in Supabase yet. Turn on Confirm email in Authentication → Providers → Email, then sign up again.')
    }
    setConfirmationSent(true)
  }

  return <AuthLayout title="Join the bootcamp" subtitle="Use your GEC Thrissur college email. We’ll verify it before your first login." footer={<>Already have an account? <Link className="font-medium text-[#14532D]" to="/login">Log in</Link></>}>
    <form onSubmit={submit} className="space-y-4">
      <label>Full name<input required value={form.fullName} onChange={change('fullName')} /></label>
      <label>Username<input required minLength="3" value={form.username} onChange={change('username')} /></label>
      <label>College email<input required type="email" placeholder={`you${COLLEGE_DOMAIN}`} value={form.email} onChange={change('email')} /></label>
      <label>Password<input required type="password" minLength="6" value={form.password} onChange={change('password')} /></label>
      {error && <p role="alert" className="error">{error}</p>}
      {confirmationSent && <p className="success">Verification email sent. Open the link in your college inbox, then return here to log in.</p>}
      <button className="primary-button w-full" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
    </form>
  </AuthLayout>
}
