import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('financeflow-user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem('financeflow-user')
      }
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // For local development, accept any credentials
    const userData = {
      id: 'local-user-1',
      email,
      name: email.split('@')[0],
      loginAt: new Date().toISOString()
    }
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('financeflow-user', JSON.stringify(userData))
    return true
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('financeflow-user')
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
