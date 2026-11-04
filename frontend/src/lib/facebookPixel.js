// ============================================================
// META (FACEBOOK) PIXEL — chargement conditionné au consentement
// ============================================================
//
// La mesure démarre dès l'arrivée et s'arrête si le visiteur refuse. Exiger
// un clic préalable revenait à ne rien mesurer du tout : Meta ne trouvait
// aucun pixel sur le site (son vérificateur ne clique pas sur une bannière),
// et la grande majorité des visiteurs ne répondent jamais à cette bannière —
// la publicité tournait donc à l'aveugle.
//
// Le refus reste entier et immédiat : « Continuer sans accepter » coupe toute
// émission et supprime les cookies déjà posés par Meta (_fbp, _fbc).
//
// L'identifiant du pixel est public : il part dans chaque page vue. Il est donc
// écrit ici en valeur par défaut, pour qu'un déploiement sans variable
// d'environnement ne laisse pas le site sans suivi — c'est arrivé une fois, et
// la publicité tournait à l'aveugle. VITE_FACEBOOK_PIXEL_ID reste prioritaire :
// elle permet de changer de pixel sans toucher au code. Les réglages du site,
// servis par le serveur, l'emportent sur les deux : changer de pixel depuis
// l'admin ne demande alors aucun déploiement.

let PIXEL_ID = import.meta.env.VITE_FACEBOOK_PIXEL_ID || '1111003928482160'
const CONSENT_KEY = 'cookie_consent'

let loaded = false

/** Le visiteur a-t-il accepté les cookies non essentiels ? */
export function hasConsent() {
  try {
    // Seul un refus explicite arrête la mesure. Pas encore de réponse = on
    // mesure, et la bannière laisse refuser à tout moment.
    return localStorage.getItem(CONSENT_KEY) !== 'false'
  } catch {
    return true // stockage bloqué : on ne peut pas lire un refus, il n'y en a pas
  }
}

export function isPixelConfigured() {
  return Boolean(PIXEL_ID)
}

/**
 * Donne au module l'identifiant venu des réglages du site.
 * @returns {boolean} vrai si le pixel reste à charger avec ce nouvel identifiant
 */
export function configurerPixel(identifiant) {
  const propre = String(identifiant || '').replace(/\D/g, '')
  if (!propre || propre === PIXEL_ID) return false
  PIXEL_ID = propre
  loaded = false // identifiant différent : le script est à recharger
  return true
}

/**
 * Injecte le script Meta. Idempotent : les appels suivants sont ignorés.
 * Ne fait rien sans identifiant configuré ou sans consentement.
 */
export function initPixel() {
  if (loaded || !PIXEL_ID || !hasConsent()) return false
  if (typeof window === 'undefined') return false

  /* eslint-disable */
  // Snippet officiel Meta — la file d'attente `fbq` absorbe les appels émis
  // avant la fin du chargement du script.
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = !0
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = !0
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */

  window.fbq('init', PIXEL_ID)
  loaded = true
  return true
}

/** Vue de page — à rappeler à chaque navigation (SPA : pas de rechargement). */
export function trackPageView() {
  if (!hasConsent()) return
  if (!loaded && !initPixel()) return
  window.fbq?.('track', 'PageView')
}

/**
 * Évènement standard Meta (ViewContent, InitiateCheckout, Purchase, Lead…).
 * @param {string} event Nom de l'évènement standard
 * @param {object} data  Paramètres (value, currency, content_ids…)
 * @param {object} [options] Options Meta, dont `eventID` : le même évènement
 *   part aussi du serveur (API Conversions) et Meta rapproche les deux pour
 *   n'en compter qu'un.
 */
export function trackEvent(event, data = {}, options) {
  if (!hasConsent()) return
  if (!loaded && !initPixel()) return
  if (options) window.fbq?.('track', event, data, options)
  else window.fbq?.('track', event, data)
}

/**
 * Retire le pixel après un refus tardif : on ne peut pas « décharger » le
 * script déjà injecté, mais on coupe toute émission ultérieure et on supprime
 * les cookies déposés par Meta.
 */
export function disablePixel() {
  loaded = false
  if (typeof window !== 'undefined') {
    window.fbq = undefined
  }
  // _fbp et _fbc sont posés par le script Meta sur le domaine du site
  for (const name of ['_fbp', '_fbc']) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }
}
