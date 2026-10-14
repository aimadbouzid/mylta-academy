import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'mylta_theme' // 'light' | 'dark' | 'system'

/** Thème effectivement affiché, une fois `system` résolu. */
function resolveTheme(preference) {
  if (preference === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return preference
}

function readStoredPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return ['light', 'dark', 'system'].includes(saved) ? saved : 'system'
  } catch {
    return 'system'
  }
}

export function ThemeProvider({ children }) {
  // 'system' par défaut : on suit les réglages du téléphone tant que
  // l'utilisateur n'a pas exprimé de choix explicite.
  const [preference, setPreference] = useState(readStoredPreference)
  const [resolved, setResolved] = useState(() => resolveTheme(readStoredPreference()))

  // Applique la classe sur <html> — c'est elle qui pilote `darkMode: 'class'`
  useEffect(() => {
    const theme = resolveTheme(preference)
    setResolved(theme)

    document.documentElement.classList.toggle('dark', theme === 'dark')

    // Barre d'adresse mobile assortie au thème
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#121212' : '#f1f5f7')

    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch { /* stockage indisponible : le thème reste valable pour la session */ }
  }, [preference])

  // Suit les changements système, uniquement en mode 'system'
  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return

    const onChange = () => {
      const theme = resolveTheme('system')
      setResolved(theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  // Bascule simple : passe explicitement à l'opposé de ce qui est affiché.
  const toggleTheme = useCallback(() => {
    setPreference(resolveTheme(preference) === 'dark' ? 'light' : 'dark')
  }, [preference])

  return (
    <ThemeContext.Provider value={{ theme: resolved, preference, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme doit être utilisé dans un ThemeProvider')
  return ctx
}
