import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false) // Default to light mode for SSR
  const [mounted, setMounted] = useState(false)

  // This effect runs only on the client side
  useEffect(() => {
    setMounted(true)
    
    // Check localStorage for saved preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('financeflow-theme')
      if (saved) {
        setIsDarkMode(saved === 'dark')
      } else {
        // Default to system preference
        setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
      }
    }
  }, [])

  useEffect(() => {
    if (!mounted) return // Don't run on server
    
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('financeflow-theme', isDarkMode ? 'dark' : 'light')
      
      // Apply theme class to document root
      const root = document.documentElement
      if (isDarkMode) {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }
    }
  }, [isDarkMode, mounted])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext