import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme] = useState<Theme>('dark')
  const isLoaded = true

  useEffect(() => {
    // Always use dark mode - no other themes supported
    applyTheme('dark')
  }, [])

  const setTheme = (_newTheme?: Theme) => {
    // No-op: theme is always dark
  }

  return { theme, setTheme, isLoaded }
}

function applyTheme(theme: Theme) {
  const html = document.documentElement
  if (theme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}
