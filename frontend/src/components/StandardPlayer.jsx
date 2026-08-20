import React, { useRef, useEffect, useState } from 'react';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';
import { AlertCircle, Film, Loader2 } from 'lucide-react';

export function getPlyrSource(url) {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  // YouTube match
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'video',
      sources: [{ src: ytMatch[1], provider: 'youtube' }],
    };
  }

  // Vimeo match
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'video',
      sources: [{ src: vimeoMatch[1], provider: 'vimeo' }],
    };
  }

  // Loom match
  const loomMatch = cleanUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    return {
      type: 'iframe',
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`
    };
  }

  // Google Drive match
  const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'iframe',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    };
  }

  // Check if iframe embed link directly
  if (cleanUrl.includes('/embed/')) {
    return {
      type: 'iframe',
      embedUrl: cleanUrl
    };
  }

  // Fallback to direct HTML5 video (MP4, WebM, etc.)
  return {
    type: 'video',
    sources: [{ src: cleanUrl }],
  };
}

export default function StandardPlayer({ url, className = '', title = 'Vidéo', initialTime = 0, onTimeUpdate, onEnded, onLoadedMetadata }) {
  const ref = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [url]);

  useEffect(() => {
    const player = ref.current?.plyr;
    if (!player) return;

    const handleTimeUpdate = () => {
      if (onTimeUpdate) {
        onTimeUpdate(player.currentTime);
      }
    };

    const handleEnded = () => {
      if (onEnded) onEnded();
    };
    
    const handleReady = () => {
      setIsLoading(false);
      if (initialTime > 0 && player.currentTime < initialTime) {
        player.currentTime = initialTime;
      }
      if (onLoadedMetadata) {
        onLoadedMetadata(player);
      }
    };

    const handlePlaying = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    player.on('timeupdate', handleTimeUpdate);
    player.on('ended', handleEnded);
    player.on('ready', handleReady);
    player.on('playing', handlePlaying);
    player.on('waiting', handleWaiting);
    player.on('canplay', handleCanPlay);
    
    player.on('error', () => {
      setIsLoading(false);
      setHasError(true);
    });

    return () => {
      player.off('timeupdate', handleTimeUpdate);
      player.off('ended', handleEnded);
      player.off('ready', handleReady);
      player.off('playing', handlePlaying);
      player.off('waiting', handleWaiting);
      player.off('canplay', handleCanPlay);
    };
  }, [url, initialTime, onTimeUpdate, onEnded, onLoadedMetadata]);

  const source = getPlyrSource(url);

  if (!url || !source) {
    return (
      <div className={`aspect-video w-full rounded-2xl bg-[#0a0a0a] border border-white/5 flex flex-col items-center justify-center p-6 text-center shadow-inner relative ${className}`}>
        <Film size={48} className="text-white/20 mb-4" />
        <p className="text-sm font-semibold text-white/40">Aucun média configuré</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`aspect-video w-full rounded-2xl bg-[#0a0a0a] border border-red-500/20 flex flex-col items-center justify-center p-6 text-center shadow-2xl relative ${className}`}>
        <AlertCircle size={48} className="text-red-400 mb-4 animate-pulse" />
        <p className="text-base font-bold text-white mb-1">Lecture impossible</p>
        <p className="text-xs text-white/50 max-w-sm">Le flux vidéo est introuvable ou a été interrompu. Veuillez rafraîchir la page ou essayer un autre lecteur.</p>
      </div>
    );
  }

  const plyrOptions = {
    i18n: {
      restart: 'Recommencer',
      rewind: 'Reculer de {seektime}s',
      play: 'Lecture',
      pause: 'Pause',
      fastForward: 'Avancer de {seektime}s',
      seek: 'Chercher',
      seekLabel: '{currentTime} sur {duration}',
      played: 'Lu',
      buffered: 'En mémoire',
      currentTime: 'Temps actuel',
      duration: 'Durée',
      volume: 'Volume',
      mute: 'Sourdine',
      unmute: 'Activer le son',
      enableCaptions: 'Activer les sous-titres',
      disableCaptions: 'Désactiver les sous-titres',
      download: 'Télécharger',
      enterFullscreen: 'Plein écran',
      exitFullscreen: 'Quitter le plein écran',
      frameTitle: 'Lecteur pour {title}',
      captions: 'Sous-titres',
      settings: 'Paramètres',
      pip: 'Mini-lecteur',
      menuBack: 'Retour au menu',
      speed: 'Vitesse',
      normal: 'Normal',
      quality: 'Qualité',
      loop: 'En boucle',
      start: 'Début',
      end: 'Fin',
      all: 'Tout',
      reset: 'Réinitialiser',
      disabled: 'Désactivé',
      enabled: 'Activé',
      qualityBadge: { 2160: '4K', 1440: 'HD', 1080: 'HD', 720: 'HD', 576: 'SD', 480: 'SD' },
    },
    controls: [
      'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
    ],
    settings: ['quality', 'speed', 'loop'],
    hideControls: true,
  };

  // Custom styling pour matcher l'identité visuelle de la plateforme (variables Plyr)
  const containerStyle = {
    '--plyr-color-main': 'var(--clr-primary, #a93232)', // Couleur primaire de l'académie
    '--plyr-video-control-color': 'rgba(255, 255, 255, 0.8)',
    '--plyr-video-control-color-hover': '#ffffff',
    '--plyr-video-controls-background': 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.85))',
    '--plyr-menu-background': 'rgba(15, 15, 15, 0.95)',
    '--plyr-menu-color': '#ffffff',
    '--plyr-font-family': 'Inter, system-ui, sans-serif',
    '--plyr-control-radius': '8px',
    '--plyr-badge-background': '#ffffff',
    '--plyr-badge-text-color': '#000000',
    '--plyr-badge-border-radius': '4px',
  };

  return (
    <div 
      className={`aspect-video w-full lg:rounded-2xl overflow-hidden bg-black lg:border lg:border-white/10 shadow-2xl relative group ${className}`}
      style={containerStyle}
    >
      {/* Overlay de chargement stylisé */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-20 transition-opacity duration-300">
           <Loader2 className="w-10 h-10 text-academy-primary animate-spin mb-3" />
           <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5">
             Chargement
           </span>
        </div>
      )}

      {source.type === 'iframe' ? (
        <iframe
          src={source.embedUrl}
          title={title}
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0 relative z-10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full relative z-10 [&_.plyr]:h-full [&_.plyr__video-wrapper]:h-full [&_.plyr__video-wrapper_video]:h-full [&_.plyr__video-wrapper_video]:object-contain">
          <Plyr
            ref={ref}
            source={source}
            options={plyrOptions}
          />
        </div>
      )}
    </div>
  );
}
