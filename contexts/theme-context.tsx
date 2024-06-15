"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type WeekendTheme } from "@/components/planner/weekend-theme-selector"

interface ThemeContextType {
  selectedTheme: WeekendTheme | null
  setSelectedTheme: (theme: WeekendTheme | null) => void
  isAnimating: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [selectedTheme, setSelectedTheme] = useState<WeekendTheme | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleThemeChange = (theme: WeekendTheme | null) => {
    setIsAnimating(true)
    setSelectedTheme(theme)
    
    // Update body class for theme-based background
    const body = document.body
    
    // Remove all existing theme classes
    body.classList.remove(
      'theme-lazy', 'theme-adventurous', 'theme-family', 
      'theme-wellness', 'theme-nature', 'theme-creative'
    )
    
    // Add new theme class if theme is selected
    if (theme) {
      const themeClass = `theme-${theme.id}`
      body.classList.add(themeClass)
    }
    
    // Reset animation state after transition
    setTimeout(() => setIsAnimating(false), 500)
  }

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('weeksync-theme')
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme)
        handleThemeChange(theme)
      } catch (error) {
        console.error('Failed to load saved theme:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Save theme to localStorage
    if (selectedTheme) {
      localStorage.setItem('weeksync-theme', JSON.stringify(selectedTheme))
    } else {
      localStorage.removeItem('weeksync-theme')
    }
  }, [selectedTheme])

  return (
    <ThemeContext.Provider
      value={{
        selectedTheme,
        setSelectedTheme: handleThemeChange,
        isAnimating,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}




