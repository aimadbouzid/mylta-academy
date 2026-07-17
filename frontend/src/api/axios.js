import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true, // Send httpOnly cookies with every request (secure auth)
})

let csrfPromise = null

// Intercepter les requêtes pour ajouter le token CSRF automatiquement
api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase()
  
  // Si c'est une requête de modification
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    let match = document.cookie.match(new RegExp('(^| )_csrf=([^;]+)'))
    
    // Si on n'a pas encore de cookie CSRF, on va le chercher
    if (!match) {
      if (!csrfPromise) {
        csrfPromise = axios.get('/api/auth/csrf-token', { withCredentials: true }).finally(() => {
          csrfPromise = null
        })
      }
      await csrfPromise
      match = document.cookie.match(new RegExp('(^| )_csrf=([^;]+)'))
    }
    
    if (match) {
      config.headers['x-csrf-token'] = decodeURIComponent(match[2])
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
      
      // Rediriger vers la connexion (seulement si on n'y est pas déjà pour éviter les boucles)
      const path = window.location.pathname
      if (!path.includes('/login') && !path.includes('/register') && path !== '/') {
        window.location.href = '/login?expired=true'
      }
    }
    return Promise.reject(error)
  }
)

export default api
