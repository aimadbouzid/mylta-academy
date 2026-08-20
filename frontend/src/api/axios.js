import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  withCredentials: true, // Send httpOnly cookies with every request (secure auth)
})

let csrfPromise = null

// Le backend nomme le cookie CSRF différemment selon l'environnement
// (voir backend/middleware/csrf.js) : `__Host-csrf` en production (préfixe
// exigé par le navigateur : Secure + Path=/ + pas de Domain), `_csrf` sinon.
// Chercher uniquement `_csrf` faisait échouer TOUTE requête de modification
// en production (403 CSRF_MISSING dès le premier POST) puisque le cookie
// réel s'appelle `__Host-csrf` et ne matchait jamais la regex.
const CSRF_COOKIE_NAME = import.meta.env.PROD ? '__Host-csrf' : '_csrf'
const csrfCookieRegex = new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]+)`)

// Intercepter les requêtes pour ajouter le token CSRF automatiquement
api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase()

  // Si c'est une requête de modification
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    let match = document.cookie.match(csrfCookieRegex)

    // Si on n'a pas encore de cookie CSRF, on va le chercher
    if (!match) {
      if (!csrfPromise) {
        csrfPromise = axios.get('/api/auth/csrf-token', { withCredentials: true }).finally(() => {
          csrfPromise = null
        })
      }
      await csrfPromise
      match = document.cookie.match(csrfCookieRegex)
    }

    if (match) {
      config.headers['x-csrf-token'] = decodeURIComponent(match[1])
    }
  }

  return config
})

// Intercepter les erreurs 401 → déconnexion automatique et redirection
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Nettoyer les données locales de l'utilisateur
      localStorage.removeItem('myltaacademy_user')

      // /auth/me est la simple vérification de session au démarrage : un 401 y
      // signifie « visiteur non connecté », ce qui est normal sur les pages
      // publiques. Ne pas rediriger, sinon la modale de connexion s'ouvrirait
      // pour tout visiteur anonyme du catalogue.
      const url = error.config?.url || ''
      const isSessionCheck = url.includes('/auth/me')

      // Rediriger vers l'accueil avec le drapeau qui ouvre la modale de connexion.
      // (Il n'existe pas de route /login : la connexion est une modale.)
      const path = window.location.pathname
      if (!isSessionCheck && path !== '/') {
        window.location.href = '/?expired=true'
      }
    }
    return Promise.reject(error)
  }
)

export default api
