import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ToastProvider } from './hooks/useToast.jsx'
import { LanguageProvider } from './context/LanguageContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'

// Après un déploiement, un onglet resté ouvert réclame des fichiers JS qui
// n'existent plus : on recharge pour récupérer la nouvelle version (au plus
// une fois toutes les 10 s, pour ne jamais boucler si le fichier manque vraiment).
window.addEventListener('vite:preloadError', (event) => {
  try {
    const last = Number(sessionStorage.getItem('mylta_chunk_reload') || 0)
    if (Date.now() - last < 10000) return
    sessionStorage.setItem('mylta_chunk_reload', String(Date.now()))
  } catch { /* stockage indisponible : on recharge quand même */ }
  event.preventDefault()
  window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'votre-client-id-google'}>
      <HelmetProvider>
          <LanguageProvider>
            <BrowserRouter>
              <AuthProvider>
                <SocketProvider>
                  <ToastProvider>
                    <SiteSettingsProvider>
                      <App />
                    </SiteSettingsProvider>
                  </ToastProvider>
                </SocketProvider>
              </AuthProvider>
            </BrowserRouter>
          </LanguageProvider>
      </HelmetProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
