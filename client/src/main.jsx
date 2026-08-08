import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles.css'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { ThemeInitializer } from './components/DarkModeToggle'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeInitializer />
    <BrowserRouter>
      <AuthProvider><App /></AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
