import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProfileProvider } from './contexts/ProfileContext'
import ModernGreenSidebar from './components/ModernGreenSidebar'
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

function AppContent() {
  const location = useLocation()
  
  
  return (
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
  )
}

function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <Router>
          <AppContent />
        </Router>
      </ProfileProvider>
    </ThemeProvider>
  )
}

export default App