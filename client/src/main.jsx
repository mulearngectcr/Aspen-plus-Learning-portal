import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles.css'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { RealtimeProvider } from './realtime/RealtimeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider><RealtimeProvider><App /></RealtimeProvider></AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
