import { useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import api from '../api/axios'

export default function ClickTracker() {
  const { socket } = useSocket()
  const lastClickRef = useRef({ time: 0, text: '' })

  useEffect(() => {
    const handleClick = (e) => {
      try {
        const target = e.target
        if (!target) return

        // Trouve l'élément le plus proche (bouton, lien, champ, carte cliquable)
        const clickableEl = target.closest('button, a, input, select, textarea, [role="button"], tr, [onclick], .cursor-pointer') || target

        let text = clickableEl.innerText || clickableEl.value || clickableEl.getAttribute('aria-label') || clickableEl.getAttribute('title') || clickableEl.getAttribute('placeholder') || ''
        text = text.trim().replace(/\s+/g, ' ').slice(0, 100)

        // Ne pas enregistrer les clics totalement vides sauf si c'est un tag explicite
        const tag = clickableEl.tagName || target.tagName
        if (!text && !['BUTTON', 'A', 'INPUT'].includes(tag)) return

        const pageUrl = window.location.pathname + window.location.search
        const elementId = clickableEl.id || clickableEl.name || (clickableEl.className ? String(clickableEl.className).slice(0, 50) : null)

        // Déboublonnage rapide (éviter le spam de clics identiques en moins de 300ms)
        const now = Date.now()
        if (now - lastClickRef.current.time < 300 && lastClickRef.current.text === text) {
          return
        }
        lastClickRef.current = { time: now, text }

        const payload = {
          pageUrl,
          elementText: text || tag,
          elementTag: tag,
          elementId: elementId || null,
        }

        // Consent check for GDPR compliance
        const consent = localStorage.getItem('cookie_consent')
        if (consent !== 'true') return

        // Envoyer via Socket.io si disponible
        if (socket && socket.connected) {
          socket.emit('track_click', payload)
        } else {
          // Fallback via HTTP POST silencieux
          api.post('/analytics/track-click', payload).catch(() => {})
        }
      } catch (err) {
        // Tracker totalement silencieux sans perturber l'expérience utilisateur
      }
    }

    window.addEventListener('click', handleClick, { capture: true, passive: true })
    return () => {
      window.removeEventListener('click', handleClick, { capture: true })
    }
  }, [socket])

  return null
}
