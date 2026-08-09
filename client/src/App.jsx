import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin, RequireAuth } from './auth/RouteGuards'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import PostDetailPage from './pages/PostDetailPage'
import ProgressPage from './pages/ProgressPage'
import CommunityPage from './pages/CommunityPage'
import LeaderboardPage from './pages/LeaderboardPage'
import { AppShell } from './components/AppShell'
import { ScrollToTop } from './components/ScrollToTop'

export default function App() {
  return <><ScrollToTop /><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route element={<RequireAuth />}>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/me" element={<ProgressPage />} />
      </Route>
      <Route element={<RequireAdmin />}><Route path="/admin/*" element={<AdminPage />} /></Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></>
}
