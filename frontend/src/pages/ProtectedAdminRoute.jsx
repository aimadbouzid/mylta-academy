// ProtectedAdminRoute.jsx

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast.jsx'
import { useLanguage } from '../context/LanguageContext'

/**
 * ProtectedAdminRoute
 *
 * Vérifie côté frontend que l'utilisateur connecté a le rôle ADMIN.
 * Double sécurité: le backend vérifie aussi via le middleware isAdmin.
 *
 * Règles:
 *   1. Si non authentifié  → redirige vers / avec message d'erreur
 *   2. Si authentifié mais non-admin → redirige vers / avec message 403
 *   3. Si admin → affiche les children
 *
 * NOTE: cette garde frontend est "côté expérience utilisateur".
 * La vraie sécurité se fait côté backend (middleware isAdmin).
 * Un utilisateur malveillant qui bypass le frontend ne peut toujours
 * pas appeler les routes /api/admin/* sans un token ADMIN valide.
 */
export default function ProtectedAdminRoute({ children }) {
  const { t } = useLanguage()
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const { error, warning } = useToast()

  useEffect(() => {
    if (loading) return // Attendre la vérification du token

    if (!isAuthenticated) {
      warning(t('admin_route.must_login'))
      navigate('/', { replace: true })
      return
    }

    if (!isAdmin) {
      error(t('admin_route.admin_only'))
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, isAdmin, loading, navigate, error, warning])

  // Pendant le chargement initial, afficher un spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-academy-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-academy-primary/20 border-t-academy-primary animate-spin" />
          <p className="text-academy-textMain/40 text-sm">{t('admin_route.verifying')}</p>
        </div>
      </div>
    )
  }

  // Si non autorisé, ne rien rendre (useEffect gère la redirection)
  if (!isAuthenticated || !isAdmin) return null

  return children
}
