import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Dropdown } from '../components/Dropdown'
import { PasswordInput } from '../components/PasswordInput'
import { apiBaseUrl } from '../lib/apiClient'
import { supabase } from '../lib/supabase'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', group: '', semester: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [groupCount, setGroupCount] = useState(10)
  const [groupsLoading, setGroupsLoading] = useState(true)
  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  useEffect(() => { void fetch(`${apiBaseUrl}/health`).then((response) => response.ok ? response.json() : null).then((data) => { if (Number.isInteger(data?.group_count) && data.group_count > 0) setGroupCount(data.group_count) }).catch(() => {}).finally(() => setGroupsLoading(false)) }, [])

  async function submit(event) {
    event.preventDefault(); setError('')
    if (!form.group || !form.semester) return setError('Select your group and semester to continue.')
    setSubmitting(true)
    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { data: { full_name: form.fullName.trim(), username: form.username.trim(), group: Number(form.group), semester: Number(form.semester) } } })
    setSubmitting(false)
    if (signUpError) return setError(signUpError.message)
    if (!data.session) return setError('Your account was created, but we could not sign you in automatically. Please log in.')
    navigate('/', { replace: true })
  }

  const groupOptions = Array.from({ length: groupCount }, (_, index) => ({ value: index + 1, label: `Group ${index + 1}` }))
  const semesterOptions = Array.from({ length: 8 }, (_, index) => ({ value: index + 1, label: `Semester ${index + 1}` }))

  return <AuthLayout title="Join the bootcamp" subtitle="Create your account and start logging your study work." footer={<>Already have an account? <Link className="font-medium text-[#137B45]" to="/login">Log in</Link></>}>
    <form onSubmit={submit} className="space-y-4">
      <label>Full name<input required placeholder="John Doe" value={form.fullName} onChange={change('fullName')} /></label>
      <label>Username<input required minLength="3" placeholder="john_doe" value={form.username} onChange={change('username')} /></label>
      <label>Email<input required type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={change('email')} /></label>
      <Dropdown label="Group" value={form.group} options={groupOptions} placeholder={groupsLoading ? 'Loading groups…' : 'Select your group'} disabled={groupsLoading} onChange={(group) => setForm({ ...form, group })} />
      <Dropdown label="Semester" value={form.semester} options={semesterOptions} placeholder="Select your semester" onChange={(semester) => setForm({ ...form, semester })} />
      <label>Password<PasswordInput value={form.password} onChange={change('password')} autoComplete="new-password" placeholder="Create a secure password" /></label>
      {error && <p role="alert" className="error">{error}</p>}
      <button className="primary-button w-full" disabled={submitting || groupsLoading}>{submitting ? 'Creating account…' : 'Create account'}</button>
    </form>
  </AuthLayout>
}
