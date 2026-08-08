import { useAuth } from '../auth/AuthContext'

export default function AdminPage() {
  const { profile } = useAuth()
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800"><section className="mx-auto max-w-4xl"><p className="font-mono text-xs uppercase tracking-wider text-slate-500">Admin workspace</p><h1 className="mt-2 text-2xl font-semibold">Moderation dashboard</h1><p className="mt-3 text-sm text-slate-600">Signed in as {profile?.full_name}. Server endpoints must still check admin access for every action.</p></section></main>
}
