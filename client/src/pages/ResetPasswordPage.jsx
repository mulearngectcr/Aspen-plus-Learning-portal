import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput } from '../components/PasswordInput'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate(); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false)
  async function submit(event) { event.preventDefault(); setError(''); setSubmitting(true); const { error: updateError } = await supabase.auth.updateUser({ password }); setSubmitting(false); if (updateError) return setError(updateError.message); navigate('/', { replace: true }) }
  return <AuthLayout title="Choose a new password" subtitle="Use at least six characters and keep it private." footer={<Link className="font-medium text-[#137B45]" to="/login">Back to login</Link>}><form onSubmit={submit} className="space-y-4"><label>New password<PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="Create a new password" /></label>{error && <p role="alert" className="error">{error}</p>}<button className="primary-button w-full" disabled={submitting}>{submitting ? 'Saving…' : 'Save new password'}</button></form></AuthLayout>
}
