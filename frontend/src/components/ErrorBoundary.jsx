import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

// Après un déploiement, une page chargée avant réclame des fichiers JS qui
// n'existent plus. Ce n'est pas un bug à montrer au visiteur : recharger
// récupère la nouvelle version. Les navigateurs formulent l'erreur chacun à
// leur façon, d'où la liste.
const CHUNK_ERROR = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading (CSS )?chunk .* failed|ChunkLoadError|MIME type|Unable to preload CSS/i
// Même clé que le garde de main.jsx : jamais plus d'un rechargement toutes
// les 10 s, pour ne pas boucler si le fichier manque vraiment.
const RELOAD_KEY = 'mylta_chunk_reload'

const reloadOnce = () => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (Date.now() - last < 10000) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch { /* stockage indisponible : on recharge quand même */ }
  window.location.reload()
  return true
}

/**
 * ErrorBoundary
 * Capture les erreurs React. Une version périmée du site se répare seule par
 * un rechargement ; seule une vraie erreur affiche l'écran de récupération.
 * En production: brancher sur un service de monitoring (Sentry, etc.)
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, reloading: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, reloading: CHUNK_ERROR.test(String(error?.message || error)) }
  }

  componentDidCatch(error, info) {
    if (this.state.reloading) {
      // Si le rechargement a déjà été tenté il y a moins de 10 s, le fichier
      // manque vraiment : on affiche l'écran d'erreur plutôt que de boucler.
      if (!reloadOnce()) this.setState({ reloading: false })
      return
    }
    // TODO production: Sentry.captureException(error, { extra: info })
    console.error('🚨 [ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    // Version périmée : on recharge sans alarmer le visiteur.
    if (this.state.reloading) {
      return (
        <div className="min-h-screen bg-academy-surface flex items-center justify-center p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-academy-textMain/60">
            <RefreshCw size={16} className="animate-spin" /> Mise à jour du site…
          </p>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-academy-surface flex items-center justify-center p-6">
        {/* Halo décoratif */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[600px] h-[600px] rounded-full opacity-5
                          bg-gradient-radial from-academy-primary to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-lg w-full text-center animate-fade-up">
          {/* Icône animée */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 rounded-full bg-academy-primary/10 animate-ping scale-150" />
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center
                            rounded-full bg-red-950/5 border-red-900/10 backdrop-blur-md border border-academy-primary/30 shadow-soft">
              <AlertTriangle className="w-10 h-10 text-academy-primary" />
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-academy-textMain mb-3">
            Une erreur s&apos;est produite
          </h1>
          <p className="text-academy-textMain/50 mb-4 leading-relaxed">
            L&apos;application a rencontré un problème inattendu dans ce composant.
          </p>

          {/* Détails dev uniquement */}
          {import.meta.env.DEV && this.state.error && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-800/40 rounded-xl text-left">
              <p className="text-red-400 font-medium text-xs break-all leading-relaxed">
                {this.state.error.toString()}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              <RefreshCw size={16} />
              Réessayer
            </button>
            <button
              onClick={() => { window.location.href = '/' }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3
                         border border-white/15 text-academy-textMain/60 rounded-xl
                         hover:border-white/30 hover:text-academy-textMain transition-all duration-300"
            >
              <Home size={16} />
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
