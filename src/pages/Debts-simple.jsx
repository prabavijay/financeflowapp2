import React from 'react'

const Debts = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            Debt Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Track and manage all your debts and loans to regain financial freedom
          </p>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8">
          <p className="text-slate-600 dark:text-slate-300">
            Debt management features are being loaded...
          </p>
        </div>
      </div>
    </div>
  )
}

export default Debts