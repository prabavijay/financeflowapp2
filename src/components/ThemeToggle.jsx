import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center p-2 rounded-lg transition-all duration-300 ease-in-out
        shadow-md hover:shadow-lg transform hover:scale-105 backdrop-blur-sm
        ${isDarkMode 
          ? 'border text-cyan-200 hover:text-white' 
          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }
      `}
      style={isDarkMode ? {
        background: 'linear-gradient(145deg, #131a1f, #0a1114)',
        borderColor: 'rgba(51, 64, 68, 0.6)',
        boxShadow: '0 4px 6px -1px rgba(0, 20, 15, 0.4), 0 2px 4px -1px rgba(0, 20, 15, 0.1), inset 0 1px 0 rgba(38, 181, 163, 0.1)'
      } : {}}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun 
          className={`absolute w-5 h-5 transition-all duration-300 ${
            isDarkMode 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`absolute w-5 h-5 transition-all duration-300 ${
            isDarkMode 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
      
      {/* Tooltip */}
      <div className={`
        absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium 
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
        rounded shadow-lg whitespace-nowrap
        ${isDarkMode 
          ? 'text-cyan-100 border' 
          : 'bg-slate-800 text-white'
        }
      `}
      style={isDarkMode ? {
        background: 'linear-gradient(145deg, #131a1f, #0a1114)',
        borderColor: 'rgba(51, 64, 68, 0.6)'
      } : {}}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        <div className={`
          absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
          border-l-4 border-r-4 border-t-4 border-transparent
          ${isDarkMode ? 'border-t-slate-700' : 'border-t-slate-800'}
        `} />
      </div>
    </button>
  )
}

export default ThemeToggle