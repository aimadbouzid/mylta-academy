import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true until initial verification

  // Restore user info from localStorage (non-sensitive data only, no tokens)
  useEffect(() => {
    const savedUser = localStorage.getItem('myltaacademy_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch { clearSession() }
    }
    
    
    // Le token CSRF est géré automatiquement par axios.js lors des requêtes POST/PUT/DELETE

    setLoading(false)
  }, [])

  const clearSession = useCallback(() => {
    setUser(null)
    localStorage.removeItem('myltaacademy_user')
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
      localStorage.setItem('myltaacademy_user', JSON.stringify(data.user))
    } catch {
      clearSession()
    }
  }, [clearSession])

  /**
   * login — Appelle POST /api/auth/login (token sent as httpOnly cookie by backend)
   * No token in localStorage — XSS safe
   */
  const login = useCallback(async (email, password) => {

    const { data } = await api.post('/auth/login', { email, password })
    setUser(data.user)
    localStorage.setItem('myltaacademy_user', JSON.stringify(data.user))
    return data
  }, [])

  /**
   * register — Appelle POST /api/auth/register
   * No token returned — user must verify email first
   */
  const register = useCallback(async (email, password, name, turnstileToken) => {
    const ref = localStorage.getItem('mylta_referral') || undefined
    const { data } = await api.post('/auth/register', { email, password, name, turnstileToken, ref })
    if (ref) {
      localStorage.removeItem('mylta_referral')
    }
    // Don't set user/token — registration requires email verification
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch { /* ignore logout errors */ }
    clearSession()
  }, [clearSession])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
