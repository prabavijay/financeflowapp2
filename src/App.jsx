import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ModernGreenSidebar from './components/ModernGreenSidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Income from './pages/Income'
import Expenses from './pages/Expenses'
import Bills from './pages/Bills'
import Debts from './pages/Debts'
import Assets from './pages/Assets'
import Budget from './pages/Budget'
import DebtReduction from './pages/DebtReduction'
import CreditLoans from './pages/CreditLoans'
import CreditLoansDebug from './pages/CreditLoans-debug'
import CreditLoansSafe from './pages/CreditLoans-safe'
import CreditLoansNew from './pages/CreditLoans-new'
import Insurance from './pages/Insurance'
import StockTracker from './pages/StockTracker'
import RetirementPlanner from './pages/RetirementPlanner'
import Subscriptions from './pages/Subscriptions'
import TravelBudgets from './pages/TravelBudgets'
import FeeTracker from './pages/FeeTracker'
import LoanComparison from './pages/LoanComparison'
import DocumentVault from './pages/DocumentVault'
import ReceiptScanner from './pages/ReceiptScanner'
import EmailReceiptProcessor from './pages/EmailReceiptProcessor'
import Accounts from './pages/Accounts'
import EstatePlanning from './pages/EstatePlanning'
import PowerOfAttorney from './pages/PowerOfAttorney'
import HelpCenter from './pages/HelpCenter'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppContent() {
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()

  // Show login page without sidebar
  if (location.pathname === '/login') {
    if (loading) return null
    if (isAuthenticated) return <Navigate to="/" replace />
    return <Login />
  }

  return (
    <ProtectedRoute>
      <ModernGreenSidebar>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/debt-reduction" element={<DebtReduction />} />
          <Route path="/credit-loans" element={<CreditLoansNew />} />
          <Route path="/credit-loans-safe" element={<CreditLoansSafe />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/stock-tracker" element={<StockTracker />} />
          <Route path="/retirement-planner" element={<RetirementPlanner />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/travel-budgets" element={<TravelBudgets />} />
          <Route path="/fee-tracker" element={<FeeTracker />} />
          <Route path="/loan-comparison" element={<LoanComparison />} />
          <Route path="/document-vault" element={<DocumentVault />} />
          <Route path="/receipt-scanner" element={<ReceiptScanner />} />
          <Route path="/email-receipt-processor" element={<EmailReceiptProcessor />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/estate-planning" element={<EstatePlanning />} />
          <Route path="/power-of-attorney" element={<PowerOfAttorney />} />
          <Route path="/help" element={<HelpCenter />} />
        </Routes>
      </ModernGreenSidebar>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<AppContent />} />
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </Router>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
