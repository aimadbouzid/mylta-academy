import React, { useEffect, useState } from 'react'

/**
 * InAppBrowserGuard
 * 
 * Detects in-app browsers (Instagram, TikTok, Facebook, Snapchat, LinkedIn, etc.)
 * and attempts to redirect the user to their default external browser.
 * Shows a fallback instruction screen if auto-redirect fails.
 */

// Detect if running inside an in-app browser
function detectInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor || ''
  
  const inAppPatterns = [
    // Instagram
    { name: 'Instagram', pattern: /Instagram/i },
    // TikTok
    { name: 'TikTok', pattern: /musical_ly|TikTok|BytedanceWebview|ByteLocale/i },
    // Facebook & Messenger
    { name: 'Facebook', pattern: /FBAN|FBAV|FB_IAB|FBIOS|FBSS/i },
    { name: 'Messenger', pattern: /Messenger/i },
    // Snapchat
    { name: 'Snapchat', pattern: /Snapchat/i },
    // Twitter / X
    { name: 'Twitter', pattern: /Twitter/i },
    // LinkedIn
    { name: 'LinkedIn', pattern: /LinkedInApp/i },
    // Pinterest
    { name: 'Pinterest', pattern: /Pinterest/i },
    // WeChat
    { name: 'WeChat', pattern: /MicroMessenger/i },
    // Telegram
    { name: 'Telegram', pattern: /TelegramBot/i },
    // Line
    { name: 'LINE', pattern: /\bLine\b/i },
    // Generic WebView detection
    { name: 'WebView', pattern: /wv\)|WebView/i },
  ]

  for (const { name, pattern } of inAppPatterns) {
    if (pattern.test(ua)) {
      return name
    }
  }

  return null
}

// Try to open the current URL in the external browser
function tryOpenExternalBrowser() {
  const currentUrl = window.location.href
  const ua = navigator.userAgent || ''

  // iOS: Use x-safari scheme or googlechrome scheme
  if (/iPhone|iPad|iPod/i.test(ua)) {
    // Try intent-based redirect for iOS Safari
    // Safari doesn't have a custom scheme, but we can use a trick
    // Opening with window.open + _system target
    const safariUrl = currentUrl
    
    // Try Google Chrome on iOS
    const chromeUrl = currentUrl.replace(/^https?:\/\//, (match) => {
      return match === 'https://' ? 'googlechromes://' : 'googlechrome://'
    })
    
    // Try Chrome first, then fall back
    window.location.href = chromeUrl
    
    // If Chrome isn't installed, after a small delay nothing happens
    // The user will see the fallback UI
    return true
  }

  // Android: Use Intent URL to open in default browser
  if (/Android/i.test(ua)) {
    try {
      const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;end`
      window.location.href = intentUrl
      return true
    } catch (e) {
      // Fallback: try opening directly
      window.open(currentUrl, '_system')
      return true
    }
  }

  return false
}

export default function InAppBrowserGuard({ children, enabled = true }) {
  const [inAppBrowser, setInAppBrowser] = useState(null)
  const [showFallback, setShowFallback] = useState(false)
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const detected = detectInAppBrowser()

    if (detected) {
      setInAppBrowser(detected)
      
      // Try auto-redirect to external browser
      const didTry = tryOpenExternalBrowser()
      setAttempted(didTry)
      
      // Show fallback after a delay (gives time for redirect to work)
      const timer = setTimeout(() => {
        setShowFallback(true)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [enabled])

  // Not in an in-app browser — render normally
  if (!inAppBrowser) {
    return children
  }

  // Waiting for redirect to kick in
  if (!showFallback) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Ouverture dans votre navigateur...</p>
        </div>
      </div>
    )
  }

  // Fallback: show instructions
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <img 
          src="/logo-256.png" 
          alt="Mylta Academy" 
          style={styles.logo}
        />

        {/* Title */}
        <h1 style={styles.title}>
          Ouvrir dans le navigateur
        </h1>

        {/* Explanation */}
        <p style={styles.description}>
          Vous êtes sur le navigateur intégré de <strong>{inAppBrowser}</strong>.
          <br />
          Pour une meilleure expérience, ouvrez ce lien dans votre navigateur principal 
          (Chrome, Safari, etc.)
        </p>

        {/* Step by step instructions */}
        <div style={styles.stepsContainer}>
          <div style={styles.step}>
            <div style={styles.stepIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
            </div>
            <p style={styles.stepText}>
              Appuyez sur <strong>⋮</strong> ou <strong>⋯</strong> (les 3 points) en haut à droite
            </p>
          </div>

          <div style={styles.step}>
            <div style={styles.stepIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </div>
            <p style={styles.stepText}>
              Choisissez <strong>"Ouvrir dans le navigateur"</strong> ou <strong>"Ouvrir dans Chrome/Safari"</strong>
            </p>
          </div>
        </div>

        {/* Copy link button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href).then(() => {
              const btn = document.getElementById('copy-link-btn')
              if (btn) {
                btn.textContent = '✓ Lien copié !'
                btn.style.background = '#10b981'
                setTimeout(() => {
                  btn.textContent = '📋 Copier le lien'
                  btn.style.background = 'linear-gradient(135deg, #2563EB, #6366f1)'
                }, 2000)
              }
            })
          }}
          id="copy-link-btn"
          style={styles.copyButton}
        >
          📋 Copier le lien
        </button>

        <p style={styles.hint}>
          Collez ensuite le lien dans Chrome ou Safari
        </p>

        {/* Skip button — let them continue anyway */}
        <button
          onClick={() => setInAppBrowser(null)}
          style={styles.skipButton}
        >
          Continuer quand même →
        </button>
      </div>

      <style>{spinnerKeyframes}</style>
    </div>
  )
}

// Spinner keyframes
const spinnerKeyframes = `
  @keyframes inapp-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes inapp-fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

// Inline styles (no dependency on tailwind or external CSS needed)
const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  loader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#2563EB',
    borderRadius: '50%',
    animation: 'inapp-spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
  },
  card: {
    background: 'rgba(30, 41, 59, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    padding: '32px 24px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    animation: 'inapp-fadeIn 0.5s ease-out',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 100px rgba(37, 99, 235, 0.1)',
  },
  logo: {
    width: '72px',
    height: '72px',
    borderRadius: '16px',
    marginBottom: '16px',
    objectFit: 'contain',
  },
  title: {
    color: '#f1f5f9',
    fontSize: '22px',
    fontWeight: 700,
    margin: '0 0 12px 0',
    lineHeight: 1.3,
  },
  description: {
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: 1.6,
    margin: '0 0 24px 0',
  },
  stepsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '12px',
    padding: '12px 16px',
    border: '1px solid rgba(99, 102, 241, 0.1)',
  },
  stepIcon: {
    flexShrink: 0,
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(99, 102, 241, 0.2))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#818cf8',
  },
  stepText: {
    color: '#cbd5e1',
    fontSize: '13px',
    lineHeight: 1.5,
    margin: 0,
    textAlign: 'left',
  },
  copyButton: {
    width: '100%',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #2563EB, #6366f1)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '8px',
  },
  hint: {
    color: '#64748b',
    fontSize: '12px',
    margin: '0 0 16px 0',
  },
  skipButton: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '8px',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
}
