import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      setShow(true)
    }
  }, [])

  // Le choix est diffusé pour que les traceurs (pixel Meta) démarrent ou
  // s'arrêtent immédiatement, sans attendre un rechargement de page.
  const setConsent = (value) => {
    localStorage.setItem('cookie_consent', value)
    window.dispatchEvent(new Event('cookieConsentChanged'))
    setShow(false)
  }

  const accept = () => setConsent('true')
  const decline = () => setConsent('false')

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-[700px] md:max-w-[95vw] md:rounded-2xl z-[100] p-5 md:p-7 bg-white dark:bg-academy-surfaceDark md:bg-white/95 md:backdrop-blur-md border-t md:border border-academy-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-soft-lg flex flex-col items-start gap-5 animate-fade-up">
      <div className="text-academy-textMain text-sm">
        <p className="font-display font-black text-lg md:text-xl mb-2 flex items-center gap-2">
          Confidentialité et Cookies 🍪
        </p>
        <p className="opacity-70 leading-relaxed text-xs md:text-sm">
          Nous utilisons des cookies essentiels au fonctionnement du site, ainsi que des outils d'analyse pour améliorer votre expérience utilisateur et mesurer notre audience. Vous gardez le contrôle total sur vos données.
        </p>
      </div>
      <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full justify-end mt-2 md:mt-0">
        <button onClick={decline} className="btn-secondary w-full sm:w-auto text-sm py-2.5 px-6 whitespace-nowrap bg-academy-surface hover:bg-academy-border">
          Continuer sans accepter
        </button>
        <button onClick={accept} className="btn-primary w-full sm:w-auto text-sm py-2.5 px-8 whitespace-nowrap shadow-soft">
          Tout Accepter
        </button>
      </div>
    </div>
  )
}
