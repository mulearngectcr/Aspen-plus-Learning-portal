import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AuthLayout } from '../components/AuthLayout'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const verified = new URLSearchParams(location.search).get('verified')

  async function submit(event) {
    event.preventDefault(); setError(''); setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword(form)
    setSubmitting(false)
    if (signInError) return setError(signInError.message)
    navigate(location.state?.from?.pathname || '/', { replace: true })
  }

  return <AuthLayout title="Welcome back" subtitle="Log today’s study work, keep your streak moving." footer={<>New here? <Link className="font-medium text-[#14532D]" to="/signup">Create an account</Link></>}>
    {verified && <p className="mb-4 rounded-lg bg-[#E4EDE7] p-3 text-sm text-[#14532D]">Email verified. You can now log in.</p>}
    <form onSubmit={submit} className="space-y-4">
      <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input required type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      {error && <p role="alert" className="error">{error}</p>}
      <button className="primary-button w-full" disabled={submitting}>{submitting ? 'Logging in…' : 'Log in'}</button>
    </form>
    <Link className="mt-5 block text-center text-sm text-[#14532D] underline" to="/forgot-password">Forgot password?</Link>
  </AuthLayout>
}
