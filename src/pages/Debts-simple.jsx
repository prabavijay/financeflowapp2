import React from 'react'

const Debts = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="p-8 space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Debt Management
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Track and manage all your debts and loans to regain financial freedom
          </p>
        </div>
        <div className="glass-card backdrop-blur-lg rounded-2xl shadow-xl border border-white/10 p-8">
          <p className="text-slate-400">
            Debt management features are being loaded...
          </p>
        </div>
      </div>
    </div>
  )
}

export default Debts