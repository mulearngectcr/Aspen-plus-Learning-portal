import { useEffect, useState } from 'react'

const STORAGE_KEY = 'chem-e-theme'

function preferredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function DarkModeToggle() {
  const [theme, setTheme] = useState(() => preferredTheme())
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem(STORAGE_KEY, theme) }, [theme])
  const dark = theme === 'dark'
  return <button type="button" onClick={() => setTheme(dark ? 'light' : 'dark')} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} className="grid size-9 place-items-center rounded-full text-[#14532D] hover:bg-[#E4EDE7] dark:text-emerald-300 dark:hover:bg-slate-800"><span aria-hidden="true">{dark ? '☀' : '☾'}</span></button>
}

export function ThemeInitializer() {
  useEffect(() => { document.documentElement.classList.toggle('dark', preferredTheme() === 'dark') }, [])
  return null
}
