import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput } from '../components/PasswordInput'
import { supabase } from '../lib/supabase'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' }); const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false)
  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value })
  async function submit(event) { event.preventDefault(); setError(''); setSubmitting(true); const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { data: { full_name: form.fullName.trim(), username: form.username.trim() } } }); setSubmitting(false); if (signUpError) return setError(signUpError.message); if (!data.session) return setError('Your account was created, but we could not sign you in automatically. Please log in.'); navigate('/', { replace: true }) }
  return <AuthLayout title="Join the bootcamp" subtitle="Create your account and start logging your study work." footer={<>Already have an account? <Link className="font-medium text-[#137B45]" to="/login">Log in</Link></>}><form onSubmit={submit} className="space-y-4"><label>Full name<input required placeholder="John Doe" value={form.fullName} onChange={change('fullName')} /></label><label>Username<input required minLength="3" placeholder="john_doe" value={form.username} onChange={change('username')} /></label><label>Email<input required type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={change('email')} /></label><label>Password<PasswordInput value={form.password} onChange={change('password')} autoComplete="new-password" placeholder="Create a secure password" /></label>{error && <p role="alert" className="error">{error}</p>}<button className="primary-button w-full" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button></form></AuthLayout>
}
