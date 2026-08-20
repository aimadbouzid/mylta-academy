// facebookAuth.js — Chargement paresseux du SDK JS Facebook + connexion
// Pas de dépendance npm : c'est la méthode d'intégration officielle de Meta,
// au même titre que le script GSI que Google recommande pour son propre login.

const FB_SDK_URL = 'https://connect.facebook.net/fr_FR/sdk.js'
// Bump si Meta dépréciait cette version : https://developers.facebook.com/docs/graph-api/changelog
const GRAPH_API_VERSION = 'v21.0'

let loadPromise = null

function loadFacebookSdk() {
  if (window.FB) return Promise.resolve(window.FB)
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID
    if (!appId) {
      reject(new Error('VITE_FACEBOOK_APP_ID manquant.'))
      return
    }

    window.fbAsyncInit = () => {
      window.FB.init({ appId, cookie: true, xfbml: false, version: GRAPH_API_VERSION })
      resolve(window.FB)
    }

    const script = document.createElement('script')
    script.src = FB_SDK_URL
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => reject(new Error('Échec du chargement du SDK Facebook.'))
    document.body.appendChild(script)
  })

  return loadPromise
}

/**
 * Ouvre la popup de connexion Facebook et résout avec un accessToken à
 * envoyer au backend (POST /auth/facebook). Rejette si l'utilisateur annule
 * ou refuse la connexion.
 */
export async function facebookLogin() {
  const FB = await loadFacebookSdk()

  return new Promise((resolve, reject) => {
    FB.login((response) => {
      if (response.authResponse?.accessToken) {
        resolve(response.authResponse.accessToken)
      } else {
        reject(new Error('Connexion Facebook annulée.'))
      }
    }, { scope: 'public_profile,email' })
  })
}
