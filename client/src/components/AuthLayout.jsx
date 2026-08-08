import { Link } from 'react-router-dom'

export function AuthLayout({ title, subtitle, children, footer }) {
  return <main className="min-h-screen bg-[#FAF8F3] px-4 py-10 sm:grid sm:place-items-center">
    <section className="mx-auto w-full max-w-md rounded-2xl border border-[#E4E0D6] bg-white p-6 shadow-sm sm:p-8">
      <Link to="/" className="text-sm font-semibold text-[#14532D]">Chem-E Bootcamp</Link>
      <h1 className="mt-8 font-serif text-3xl font-semibold text-[#1A1D1B]">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">{subtitle}</p>
      <div className="mt-7">{children}</div>
      {footer && <div className="mt-6 text-center text-sm text-stone-600">{footer}</div>}
    </section>
  </main>
}
