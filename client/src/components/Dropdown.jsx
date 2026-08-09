import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

export function Dropdown({ label, value, options, placeholder, onChange, disabled = false }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const labelId = useId()
  const listboxId = useId()
  const selected = options.find((option) => String(option.value) === String(value))

  useEffect(() => {
    function closeOnOutsideClick(event) { if (!containerRef.current?.contains(event.target)) setOpen(false) }
    function closeOnEscape(event) { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeOnOutsideClick); document.removeEventListener('keydown', closeOnEscape) }
  }, [])

  return <div ref={containerRef} className="relative">
    <span id={labelId} className="block text-sm font-semibold text-[#284236]">{label}</span>
    <button type="button" aria-labelledby={labelId} aria-controls={listboxId} aria-expanded={open} aria-haspopup="listbox" disabled={disabled} onClick={() => setOpen((current) => !current)} className={`mt-1.5 flex w-full items-center justify-between rounded-xl border bg-white px-3 py-3 text-left text-sm shadow-sm outline-none transition focus:ring-4 disabled:bg-stone-50 ${open ? 'border-[#16834A] ring-[#DDF2E4]' : 'border-[#D6E5D9] hover:border-[#9DC5AA]'} ${selected ? 'text-[#13251D]' : 'text-stone-400'}`}>
      <span>{selected?.label ?? placeholder}</span><ChevronDown aria-hidden="true" size={18} className={`shrink-0 text-[#4D705A] transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div id={listboxId} role="listbox" aria-labelledby={labelId} className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-[#D6E5D9] bg-white p-1.5 shadow-[0_16px_36px_rgba(19,37,29,0.16)]">
      {options.map((option) => { const isSelected = String(option.value) === String(value); return <button key={option.value} type="button" role="option" aria-selected={isSelected} onClick={() => { onChange(String(option.value)); setOpen(false) }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${isSelected ? 'bg-[#EAF6ED] font-semibold text-[#14532D]' : 'text-[#284236] hover:bg-[#F3F8F4]'}`}>{option.label}{isSelected && <Check aria-hidden="true" size={17} />}</button> })}
    </div>}
  </div>
}
