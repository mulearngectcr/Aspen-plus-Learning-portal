import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function PasswordInput({ value, onChange, placeholder = 'Enter your password', autoComplete = 'current-password' }) {
  const [visible, setVisible] = useState(false)
  return <span className="relative block"><input required minLength="6" type={visible ? 'text' : 'password'} autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={onChange} className="pr-12" /><button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Hide password' : 'Show password'} className="absolute bottom-2.5 right-2 grid size-9 place-items-center rounded-lg text-[#627468] hover:bg-[#EAF6ED] hover:text-[#137B45]">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
}
