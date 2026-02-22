import { useThemeStore, getEffectiveTheme, initThemeSystem, type Theme } from '../store/themeStore'

let themeCleanup: (() => void) | null = null

export function useTheme() {
  const { theme, setTheme } = useThemeStore()

  return {
    theme,
    setTheme,
    effectiveTheme: getEffectiveTheme(theme)
  }
}

export function initTheme(): void {
  if (typeof window === 'undefined') return

  if (themeCleanup) {
    themeCleanup()
  }

  themeCleanup = initThemeSystem()
}

export type { Theme }
