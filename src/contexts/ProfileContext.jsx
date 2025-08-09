import React, { createContext, useContext, useState } from 'react'

const ProfileContext = createContext()

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

export const ProfileProvider = ({ children }) => {
  const [selectedProfile, setSelectedProfile] = useState('Personal')

  return (
    <ProfileContext.Provider value={{ selectedProfile, setSelectedProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}
