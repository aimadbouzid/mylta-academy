import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initPixel, trackPageView, disablePixel, hasConsent, configurerPixel } from '../lib/facebookPixel'
import { useSiteSettings } from '../context/SiteSettingsContext'

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
  const { settings } = useSiteSettings()

  // L'identifiant arrive avec les réglages du site, un instant après le premier
  // rendu. S'il diffère de celui compilé, on recharge et on compte la page en
  // cours : changer de pixel depuis l'admin prend effet sans déploiement.
  useEffect(() => {
    const identifiant = settings?.facebookPixelId
    if (!identifiant) return
    if (configurerPixel(identifiant) && hasConsent()) {
      if (initPixel()) trackPageView()
    }
  }, [settings?.facebookPixelId])

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
