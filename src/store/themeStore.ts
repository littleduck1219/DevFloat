import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme

  root.setAttribute('data-theme', effectiveTheme)
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      }
    }),
    {
      name: 'devfloat-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      }
    }
  )
)

export function initThemeSystem(): () => void {
  const { theme } = useThemeStore.getState()
  applyTheme(theme)

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  function handleSystemThemeChange(): void {
    const currentState = useThemeStore.getState()
    if (currentState.theme === 'system') {
      applyTheme('system')
    }
  }

  mediaQuery.addEventListener('change', handleSystemThemeChange)

  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }
}

export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme
}
