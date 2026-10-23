import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import DashboardLayout from './components/layout/DashboardLayout'
import LandingPage from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ExpensesPage from './pages/expenses/ExpensesPage'
import IncomePage from './pages/income/IncomePage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import BudgetPage from './pages/budget/BudgetPage'
import GoalsPage from './pages/goals/GoalsPage'
import CalendarPage from './pages/calendar/CalendarPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import ProfilePage from './pages/profile/ProfilePage'
import SettingsPage from './pages/settings/SettingsPage'
import AIAssistantPage from './pages/ai/AIAssistantPage'
import ReportsPage from './pages/reports/ReportsPage'
import SearchPage from './pages/search/SearchPage'

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#051F20]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#8EB69B] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8EB69B] text-sm font-mono">Loading ExpenseFlow...</p>
        </div>
      </div>
    )
  }
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null
  return token ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="income" element={<IncomePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="ai" element={<AIAssistantPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="search" element={<SearchPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
          toastStyle={{
            background: '#0B2B26',
            color: '#DAF1DE',
            border: '1px solid rgba(142, 182, 155, 0.2)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
