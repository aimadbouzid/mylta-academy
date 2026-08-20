// IntroVideoModal.jsx — Modal de vidéo de présentation/introduction pour Mylta Academy
import { useState, useEffect } from 'react'
import { X, Volume2, Sparkles } from 'lucide-react'
import api from '../api/axios'
import UniversalVideoPlayer from './UniversalVideoPlayer'

export default function IntroVideoModal({ onClose }) {
  const [videoUrl, setVideoUrl] = useState('')

  useEffect(() => {
    api.get('/config/intro-video')
      .then(res => {
        if (res.data?.introVideoUrl) {
          setVideoUrl(res.data.introVideoUrl)
        } else {
          setVideoUrl('https://www.youtube.com/watch?v=M7lc1UVf-VE')
        }
      })
      .catch(() => {
        setVideoUrl('https://www.youtube.com/watch?v=M7lc1UVf-VE')
      })
  }, [])

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop sombre et flou */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" />

      {/* Container de la modal (Ancien design rétabli) */}
      <div
        className="relative w-full max-w-3xl bg-red-950/10 border-red-900/15 backdrop-blur-2xl border border-academy-border/50
                   rounded-2xl shadow-soft-lg animate-fade-up overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture flottant épuré sans texte */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-black/40 border border-white/10 hover:bg-black/60 text-white
                     flex items-center justify-center transition-all focus:outline-none shadow-md"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        {/* Zone Vidéo — 16:9 avec chargement dynamique */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {!videoUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
              {/* Effet lumineux bleu rotatif sur tout le cadre */}
              <div 
                className="absolute w-[200%] h-[200%] animate-[spin_4s_linear_infinite]"
                style={{
                  background: 'conic-gradient(from 180deg at 50% 50%, #000000 0%, #3b82f6 50%, #000000 100%)',
                }}
              />
              {/* Masque intérieur sombre pour former la bordure lumineuse */}
              <div className="absolute inset-[2px] bg-[#0c0a09] rounded-2xl flex flex-col items-center justify-center z-10">
                <div className="w-12 h-12 border-4 border-white/10 border-t-[#3b82f6] rounded-full animate-spin mb-3" />
                <span className="text-white/50 text-xs font-sans tracking-wider">Chargement de la présentation...</span>
              </div>
            </div>
          ) : (
            <UniversalVideoPlayer url={videoUrl} title="Vidéo de présentation Mylta Academy" />
          )}
        </div>
      </div>
    </div>
  )
}

