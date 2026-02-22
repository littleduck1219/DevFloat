import { useTheme, type Theme } from '../hooks/useTheme'

const themeIcons: Record<Theme, string> = {
  light: '☀️',
  dark: '🌙',
  system: '💻'
}

const themeLabels: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System'
}

const THEMES: Theme[] = ['light', 'dark', 'system']

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const nextTheme = (): void => {
    const currentIndex = THEMES.indexOf(theme)
    const nextIndex = (currentIndex + 1) % THEMES.length
    setTheme(THEMES[nextIndex])
  }

  return (
    <div className="theme-toggle">
      <button
        onClick={nextTheme}
        aria-label={`Current theme: ${themeLabels[theme]}. Click to switch to next theme.`}
        title={`Current: ${themeLabels[theme]}`}>
        {themeIcons[theme]}
      </button>
    </div>
  )
}
