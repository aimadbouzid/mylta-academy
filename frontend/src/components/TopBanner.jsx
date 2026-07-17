import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { Timer, Sparkles, Flame, Gift, Megaphone, ArrowRight, X } from 'lucide-react'

export default function TopBanner() {
    const [config, setConfig] = useState(() => {
    const cached = localStorage.getItem('mylta_topBanner_cache')
    return cached ? JSON.parse(cached) : {
      isActive: true,
      text: "🚀 Promo exceptionnelle : -50% sur toutes les formations ! Inscrivez-vous vite.",
      icon: "sparkles",
      animation: "marquee",
      linkUrl: "/courses",
      linkText: "Voir l'offre"
    }
  })
  const [isLoaded, setIsLoaded] = useState(true) // Start true if we have initial state
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  // Messages array combining config text and a 2nd default message
  const messages = config ? [
    config.text,
    "🔥 Places limitées ! Sécurisez votre place et commencez à apprendre dès aujourd'hui."
  ] : []

  // Fetch settings in background to update cache
  useEffect(() => {
    let mounted = true
    api.get('/config/site')
      .then(res => {
        if (mounted && res.data?.settings?.topBanner) {
          const newConfig = res.data.settings.topBanner;
          setConfig(newConfig)
          localStorage.setItem('mylta_topBanner_cache', JSON.stringify(newConfig))
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  if (!isLoaded || !config || !config.isActive) return null

  // Determine icon
  const getIcon = () => {
    switch (config.icon) {
      case 'sparkles': return <Sparkles size={14} className="text-yellow-300 animate-pulse" />
      case 'flame': return <Flame size={14} className="text-orange-400 animate-pulse" />
      case 'gift': return <Gift size={14} className="text-pink-300 animate-bounce" />
      case 'megaphone': return <Megaphone size={14} className="text-white" />
      default: return null
    }
  }

  return (
    <div className="w-full px-2 sm:px-4 flex justify-center pt-2 sm:pt-3 pb-1 bg-transparent z-50 pointer-events-none overflow-hidden">
      <div className="w-full max-w-4xl h-[32px] sm:h-[36px] bg-black/90 backdrop-blur-[32px] saturate-[1.2] text-white rounded-full flex items-center shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3)] border border-white/10 relative pointer-events-auto hover:bg-black transition-colors duration-500 group overflow-hidden">
        
        {/* Subtle inner highlight */}
        <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

        {/* Background Text Layer (Spans full width for true marquee) */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className={`${config.animation === 'marquee' ? 'animate-marquee-track' : 'w-full flex justify-center'} ${config.animation === 'pulse' ? 'animate-pulse' : ''} text-[10px] sm:text-[11px] font-bold tracking-wide text-white/90`}>
            
            {/* First sequence */}
            <div className="flex items-center gap-12 px-6 whitespace-nowrap">
              <div className="flex items-center gap-2">
                {getIcon()}
                <span className="drop-shadow-sm tracking-wider uppercase">{messages[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-orange-400 animate-pulse" />
                <span className="drop-shadow-sm tracking-wider uppercase">{messages[1]}</span>
              </div>
            </div>

            {/* Second sequence for seamless loop */}
            {config.animation === 'marquee' && (
              <div className="flex items-center gap-12 px-6 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {getIcon()}
                  <span className="drop-shadow-sm tracking-wider uppercase">{messages[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-orange-400 animate-pulse" />
                  <span className="drop-shadow-sm tracking-wider uppercase">{messages[1]}</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Foreground Interactive Layer (Buttons) */}
        <div className="w-full px-1.5 sm:px-2 flex items-center justify-end relative z-10 pointer-events-none">
          {/* Link button */}
          {config.linkUrl && config.linkText && (
            <Link 
              to={config.linkUrl}
              className="pointer-events-auto inline-flex items-center gap-1.5 bg-white text-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 hover:bg-gray-100 transition-all duration-300 whitespace-nowrap shadow-sm"
            >
              <span className="hidden sm:inline">{config.linkText}</span>
              <span className="inline sm:hidden">Go</span>
              <ArrowRight size={10} strokeWidth={3} />
            </Link>
          )}
        </div>

      </div>
    </div>
  )
}
