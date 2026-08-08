import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../lib/apiClient'

export default function HomePage() {
  const { profile, signOut } = useAuth()
  const [apiState, setApiState] = useState('')

  async function verifyApiClient() {
    try {
      await api.get('/me')
      setApiState('Connected to the API.')
    } catch (error) {
      setApiState(error.message)
    }
  }

  return <main className="min-h-screen bg-[#FAF8F3] px-4 py-7 sm:px-8">
    <header className="mx-auto flex max-w-3xl items-center justify-between border-b border-[#E4E0D6] pb-5">
      <span className="font-serif text-xl font-semibold text-[#14532D]">Chem-E Bootcamp</span>
      <button className="text-sm font-medium text-stone-600 underline" onClick={() => void signOut()}>Sign out</button>
    </header>
    <section className="mx-auto max-w-3xl py-12">
      <p className="font-mono text-xs uppercase tracking-wider text-[#C08A2E]">Your workspace</p>
      <h1 className="mt-3 font-serif text-3xl text-[#1A1D1B]">Hi, {profile?.full_name || 'there'}.</h1>
      <p className="mt-3 max-w-lg text-stone-600">You’re signed in. Feed, streak, and notification features can use the authenticated API client from here.</p>
      <button className="primary-button mt-7" onClick={() => void verifyApiClient()}>Check API connection</button>
      {apiState && <p className="mt-3 text-sm text-stone-600">{apiState}</p>}
    </section>
  </main>
}
