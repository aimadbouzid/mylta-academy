import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Compass } from 'lucide-react'
import SEOHead from './SEOHead' // We will put SEOHead in components
import Navbar from './Navbar'
import { useLanguage } from '../context/LanguageContext'

export default function NotFoundPage() {
  const { t, currentLang } = useLanguage()
  const navigate = useNavigate()
  const isRTL = currentLang === 'ar'

  // Une page introuvable est souvent atteinte depuis un lien externe : dans ce
  // cas l'historique ne contient rien à quoi revenir, et le bouton « retour »
  // ne ferait rien. On ne l'affiche que s'il y a bien une entrée précédente.
  const canGoBack = window.history.length > 1

  return (
    <>
      <SEOHead
        title={t('not_found.title')}
        description={t('not_found.description')}
        canonicalPath="/404"
        noindex
      />
      <Navbar />

      <main className="relative min-h-screen bg-academy-surface overflow-hidden flex items-center justify-center px-4 py-28">
        {/* Décor : halo unique, sans filtre de flou (coûteux sur mobile) */}
        <div
          className="pointer-events-none select-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 45% at 50% 35%, rgb(var(--academy-primary) / 0.10) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-md w-full text-center">
          {/* Le « 404 » sert de décor : masqué aux lecteurs d'écran, le titre
              réel étant le message qui suit. */}
          <div className="relative mb-6 animate-fade-up" aria-hidden="true">
            <span className="block font-black leading-none tracking-tighter text-[8rem] sm:text-[9rem] bg-gradient-to-b from-academy-primary to-academy-primary/20 bg-clip-text text-transparent">
              404
            </span>
            <Compass
              className="absolute inset-0 m-auto text-academy-primary/25 animate-float"
              size={64}
              strokeWidth={1.25}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-academy-textMain mb-3">
            {t('not_found.heading')}
          </h1>
          <p className="text-academy-textMain/55 mb-10">
            {t('not_found.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn-primary w-full sm:w-auto">
              <Home size={18} />
              {t('not_found.back_home')}
            </Link>
            {canGoBack && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-outline w-full sm:w-auto"
              >
                <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
                {t('not_found.go_back')}
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
