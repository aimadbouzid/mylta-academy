import React, { useState, useEffect } from 'react'
import { AlertCircle, Film } from 'lucide-react'

export function parseVideoUrl(url, initialTime = 0) {
  if (!url || typeof url !== 'string') return { type: 'none' }

  const cleanUrl = url.trim()
  if (!cleanUrl) return { type: 'none' }

  const ytTime = initialTime > 0 ? `&start=${Math.floor(initialTime)}` : ''
  const vimeoTime = initialTime > 0 ? `#t=${Math.floor(initialTime)}s` : ''

  // YouTube matchers: youtube.com/watch?v=xxx, youtube.com/embed/xxx, youtu.be/xxx, youtube.com/shorts/xxx
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'iframe',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&playsinline=1&modestbranding=1${ytTime}`
    }
  }

  // Vimeo matcher: vimeo.com/xxx
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/i)
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'iframe',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1${vimeoTime}`
    }
  }

  // Loom matcher: loom.com/share/xxx or loom.com/embed/xxx
  const loomMatch = cleanUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i)
  if (loomMatch && loomMatch[1]) {
    return {
      type: 'iframe',
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`
    }
  }

  // Google Drive matcher
  const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i)
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'iframe',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    }
  }

  // Check if iframe embed link directly
  if (cleanUrl.includes('/embed/')) {
    return {
      type: 'iframe',
      embedUrl: cleanUrl
    }
  }

  // Direct MP4 / WebM / HTML5 video file URL
  return {
    type: 'video',
    src: cleanUrl
  }
}

export default function UniversalVideoPlayer({ url, className = '', title = 'Vidéo', initialTime = 0, onTimeUpdate }) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setHasError(false)
    setIsLoading(true)
    // Filet de sécurité : l'overlay de chargement ne doit jamais masquer la
    // vidéo indéfiniment. L'événement `load` de l'iframe ne se déclenche pas
    // toujours (lecteur tiers bloqué, réseau filtré, événement manqué) — sans
    // ce délai, le lecteur restait sur « Chargement du lecteur… » pour de bon.
    const timer = setTimeout(() => setIsLoading(false), 4000)
    return () => clearTimeout(timer)
  }, [url])

  const videoInfo = parseVideoUrl(url)

  if (!url || videoInfo.type === 'none') {
    return (
      <div className={`aspect-video w-full rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-col items-center justify-center text-neutral-400 dark:text-academy-textMain/40 p-6 text-center shadow-inner ${className}`}>
        <Film size={40} className="text-neutral-600 dark:text-academy-textMain/60 mb-3" />
        <p className="text-sm font-semibold text-neutral-300">Aucune vidéo configurée</p>
        <p className="text-xs text-neutral-500 dark:text-academy-textMain/50 mt-1 max-w-sm">
          Saisissez un lien YouTube/Vimeo ou téléversez un fichier MP4 pour activer l'aperçu.
        </p>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className={`aspect-video w-full rounded-2xl bg-neutral-900/90 border border-red-500/20 flex flex-col items-center justify-center text-neutral-300 p-6 text-center shadow-2xl ${className}`}>
        <AlertCircle size={40} className="text-red-400 mb-3 animate-bounce" />
        <p className="text-sm font-bold text-white">Impossible de lire la vidéo</p>
        <p className="text-xs text-neutral-400 dark:text-academy-textMain/40 mt-1 max-w-md">
          Le fichier vidéo ou l'URL spécifiée est introuvable (404) ou non supportée. Veuillez vérifier le lien YouTube/Vimeo ou téléverser un fichier MP4 valide.
        </p>
      </div>
    )
  }

  if (videoInfo.type === 'iframe') {
    return (
      <div className={`aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
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
              <span className="text-white/40 text-xs font-sans tracking-widest uppercase">Chargement du lecteur...</span>
            </div>
          </div>
        )}
        <iframe
          src={videoInfo.embedUrl}
          title={title}
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0"
          // `fullscreen` dans allow = forme moderne (Permissions Policy).
          // L'attribut allowFullScreen seul suffit sur Chrome desktop, mais
          // certains navigateurs — Safari iOS notamment — s'appuient sur allow.
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className={`aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center shadow-2xl relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
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
            <span className="text-white/40 text-xs font-sans tracking-widest uppercase">Chargement du média...</span>
          </div>
        </div>
      )}
      <video
        key={url}
        src={url}
        controls
        playsInline
        onCanPlayThrough={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        onTimeUpdate={(e) => onTimeUpdate?.(e.target)}
        onLoadedMetadata={(e) => {
          if (initialTime > 0) {
            e.target.currentTime = initialTime;
          }
        }}
        className="w-full h-full object-contain"
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    </div>
  )
}
