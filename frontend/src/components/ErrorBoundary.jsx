import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

/**
 * ErrorBoundary
 * Capture les erreurs React et affiche un écran de récupération élégant
 * en conservant le thème sombre/doré de la plateforme.
 * En production: brancher sur un service de monitoring (Sentry, etc.)
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // TODO production: Sentry.captureException(error, { extra: info })
    console.error('🚨 [ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

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
              onClick={() => this.setState({ hasError: false, error: null })}
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
