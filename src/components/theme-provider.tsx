import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}

const ThemeProviderContext = createContext<ThemeProviderProps>({
  children: null,
  defaultTheme: 'system',
  storageKey: 'vite-ui-theme'
})

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system', 
  storageKey = 'vite-ui-theme' 
}: ThemeProviderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <ThemeProviderContext.Provider value={{ children, defaultTheme, storageKey }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useThemeContext = () => useContext(ThemeProviderContext)
