import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, Eye, EyeOff, ArrowRight, Shield, TrendingUp, PieChart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setIsLoading(true)
    try {
      const success = login(email, password)
      if (success) {
        navigate('/')
      } else {
        setError('Invalid credentials')
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col space-y-8 pr-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-lg shadow-cyan-500/20">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              FinanceFlow
            </h1>
          </div>

          <p className="text-xl text-slate-300 leading-relaxed">
            Take control of your finances with intelligent tracking, AI-powered insights, and comprehensive portfolio management.
          </p>

          <div className="space-y-5 mt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Smart Income & Expense Tracking</h3>
                <p className="text-slate-400 text-sm mt-1">Monitor every dollar with automatic categorization and trend analysis</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 flex-shrink-0">
                <PieChart className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">AI-Powered Budget Insights</h3>
                <p className="text-slate-400 text-sm mt-1">Get personalized recommendations to optimize your spending</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Secure Document Vault</h3>
                <p className="text-slate-400 text-sm mt-1">Store and manage financial documents with enterprise-grade security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile branding */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-lg shadow-cyan-500/20">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              FinanceFlow
            </h1>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-slate-400 mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-[rgba(15,25,50,0.6)] border border-[rgba(100,150,255,0.1)] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg bg-[rgba(15,25,50,0.6)] border border-[rgba(100,150,255,0.1)] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[rgba(100,150,255,0.08)]">
              <p className="text-center text-sm text-slate-500">
                Secure access to your financial dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
