import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AuthLayout } from '../components/AuthLayout'

const COLLEGE_DOMAIN = '@gectcr.ac.in'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function submit(event) {
    event.preventDefault(); setError('')
    if (!form.email.trim().toLowerCase().endsWith(COLLEGE_DOMAIN)) return setError(`Use your ${COLLEGE_DOMAIN} college email.`)
    setSubmitting(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(), password: form.password,
      options: { data: { full_name: form.fullName.trim(), username: form.username.trim() } },
    })
    setSubmitting(false)
    if (signUpError) return setError(signUpError.message)
    if (data.session) navigate('/', { replace: true })
    else setError('Account created, but no session was returned. Confirm Email may still be enabled in Supabase Auth settings.')
  }

  return <AuthLayout title="Join the bootcamp" subtitle="Use your GEC Thrissur college email." footer={<>Already have an account? <Link className="font-medium text-[#14532D]" to="/login">Log in</Link></>}>
    <form onSubmit={submit} className="space-y-4">
      <label>Full name<input required value={form.fullName} onChange={change('fullName')} /></label>
      <label>Username<input required minLength="3" value={form.username} onChange={change('username')} /></label>
      <label>College email<input required type="email" placeholder={`you${COLLEGE_DOMAIN}`} value={form.email} onChange={change('email')} /></label>
      <label>Password<input required type="password" minLength="6" value={form.password} onChange={change('password')} /></label>
      {error && <p role="alert" className="error">{error}</p>}
      <button className="primary-button w-full" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
    </form>
  </AuthLayout>
}
