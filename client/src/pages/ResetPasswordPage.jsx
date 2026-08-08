import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AuthLayout } from '../components/AuthLayout'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault(); setError(''); setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (updateError) return setError(updateError.message)
    navigate('/', { replace: true })
  }

  return <AuthLayout title="Choose a new password" subtitle="Use at least six characters." footer={<Link className="font-medium text-[#14532D]" to="/login">Back to login</Link>}>
    <form onSubmit={submit} className="space-y-4">
      <label>New password<input required type="password" minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error && <p role="alert" className="error">{error}</p>}
      <button className="primary-button w-full" disabled={submitting}>{submitting ? 'Saving…' : 'Save new password'}</button>
    </form>
  </AuthLayout>
}
