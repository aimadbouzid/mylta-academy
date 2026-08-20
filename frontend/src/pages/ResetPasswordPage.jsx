import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader, CheckCircle2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import { useLanguage } from '../context/LanguageContext'
import api from '../api/axios'

export default function ResetPasswordPage() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Lien de réinitialisation invalide ou expiré.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (password !== confirmPassword) {
      return setError('Les mots de passe ne correspondent pas.')
    }

    if (password.length < 8) {
      return setError('Le mot de passe doit contenir au moins 8 caractères.')
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setSuccess(true)
      setTimeout(() => navigate('/?login=true'), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-academy-surface flex flex-col">
        <SEOHead title="Mot de passe réinitialisé | Mylta Academy" />
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-academy-surfaceDark p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-academy-border">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-academy-textMain mb-2">Mot de passe modifié !</h2>
            <p className="text-academy-textMain/60 mb-6">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
            </p>
            <button 
              onClick={() => navigate('/?login=true')}
              className="w-full py-3 bg-academy-primary text-academy-onPrimary rounded-xl font-bold hover:bg-academy-primary/90 transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academy-surface flex flex-col">
      <SEOHead title="Réinitialiser le mot de passe | Mylta Academy" />
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-academy-surfaceDark p-8 rounded-2xl shadow-xl max-w-md w-full border border-academy-border">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black font-display text-academy-textMain mb-2">Nouveau mot de passe</h1>
            <p className="text-sm text-academy-textMain/60">
              Veuillez choisir un nouveau mot de passe sécurisé pour votre compte.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium border border-red-100 dark:border-red-500/20">
              {error}
            </div>
          )}

          {!token ? (
            <div className="text-center">
              <button 
                onClick={() => navigate('/')}
                className="w-full py-3 bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-academy-textMain/75 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-academy-textMain mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-academy-textMain/40" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-academy-surface border border-academy-border focus:border-academy-primary focus:ring-2 focus:ring-academy-primary/20 outline-none transition-all"
                    placeholder="Minimum 8 caractères"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-academy-textMain/40 hover:text-academy-textMain"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-academy-textMain mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-academy-textMain/40" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-academy-surface border border-academy-border focus:border-academy-primary focus:ring-2 focus:ring-academy-primary/20 outline-none transition-all"
                    placeholder="Répétez le mot de passe"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-academy-primary text-academy-onPrimary rounded-xl font-bold hover:bg-academy-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader className="animate-spin" size={20} /> : 'Valider'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
