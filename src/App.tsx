import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { BottomBar, type NavKey } from './components/BottomBar'
import { HomePage } from './pages/HomePage'
import { ExpensesPage } from './pages/ExpensesPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { SettingsPage } from './pages/SettingsPage'
import { AddExpensePage } from './pages/AddExpensePage'
import { ExpenseDetailsPage } from './pages/ExpenseDetailsPage'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  useTheme()
  // Triggers anonymous sign-in behind the scenes (no UI).
  useAuth()

  const active: NavKey =
    location.pathname === '/'
      ? 'home'
      : location.pathname.startsWith('/expenses') ||
          location.pathname.startsWith('/expense')
        ? 'expenses'
        : location.pathname.startsWith('/statistics')
          ? 'statistics'
          : location.pathname.startsWith('/settings')
            ? 'settings'
            : 'home'

  const hideChrome =
    location.pathname.startsWith('/add') ||
    location.pathname.startsWith('/expense/')

  return (
    <>
      <main className="mx-auto w-full max-w-[430px] min-h-screen bg-bg dark:bg-bg-dark relative pb-24">
        {children}
      </main>
      {!hideChrome ? <BottomBar active={active} /> : null}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/add" element={<AddExpensePage />} />
          <Route path="/expense/:id" element={<ExpenseDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
