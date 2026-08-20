import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initPixel, trackPageView, disablePixel, hasConsent } from '../lib/facebookPixel'

/**
 * Pilote le pixel Meta au fil de la navigation.
 *
 * Monté une seule fois dans App, sous le routeur. Deux responsabilités :
 *  1. suivre les changements de page — dans une SPA, aucun rechargement ne se
 *     produit, le snippet Meta ne compterait donc qu'une seule vue par session ;
 *  2. réagir au choix de cookies sans exiger de rechargement.
 *
 * N'affiche rien.
 */
export default function FacebookPixel() {
  const location = useLocation()

  // Réagit au choix de l'utilisateur dans la bannière de consentement
  useEffect(() => {
    const onConsentChange = () => {
      if (hasConsent()) {
        if (initPixel()) trackPageView()
      } else {
        disablePixel()
      }
    }

    window.addEventListener('cookieConsentChanged', onConsentChange)
    // Autres onglets : le consentement est partagé via localStorage
    window.addEventListener('storage', onConsentChange)
    return () => {
      window.removeEventListener('cookieConsentChanged', onConsentChange)
      window.removeEventListener('storage', onConsentChange)
    }
  }, [])

  // Une vue par navigation (y compris le premier rendu)
  useEffect(() => {
    trackPageView()
  }, [location.pathname])

  return null
}
