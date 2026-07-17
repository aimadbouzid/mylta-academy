import React, { useEffect, useRef } from 'react';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';

export default function PremiumPlayer({ videoUrl, onEnded, onTimeUpdate, onLoadedMetadata, onError }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.plyr) {
      const player = ref.current.plyr;

      const handleTime = () => onTimeUpdate(player.currentTime);
      const handleLoaded = () => onLoadedMetadata(player);
      const handleEnded = () => onEnded();
      const handleErr = (e) => onError(e);

      player.on('timeupdate', handleTime);
      player.on('loadedmetadata', handleLoaded);
      player.on('ended', handleEnded);
      player.on('error', handleErr);

      return () => {
        player.off('timeupdate', handleTime);
        player.off('loadedmetadata', handleLoaded);
        player.off('ended', handleEnded);
        player.off('error', handleErr);
      };
    }
  }, [videoUrl, onEnded, onTimeUpdate, onLoadedMetadata, onError]);

  if (!videoUrl) return null;

  return (
    <Plyr
      ref={ref}
      source={{
        type: 'video',
        sources: [{ src: videoUrl, type: 'video/mp4' }]
      }}
      options={{
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'],
        settings: ['speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        autoplay: true,
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        i18n: {
          restart: 'Recommencer',
          rewind: 'Reculer de {seektime}s',
          play: 'Lecture',
          pause: 'Pause',
          fastForward: 'Avancer de {seektime}s',
          seek: 'Chercher',
          seekLabel: '{currentTime} de {duration}',
          played: 'Lu',
          buffered: 'En mémoire',
          currentTime: 'Temps actuel',
          duration: 'Durée',
          volume: 'Volume',
          mute: 'Muet',
          unmute: 'Activer le son',
          enableCaptions: 'Activer les sous-titres',
          disableCaptions: 'Désactiver les sous-titres',
          download: 'Télécharger',
          enterFullscreen: 'Plein écran',
          exitFullscreen: 'Quitter le plein écran',
          frameTitle: 'Lecteur pour {title}',
          captions: 'Sous-titres',
          settings: 'Paramètres',
          menuBack: 'Retour',
          speed: 'Vitesse',
          normal: 'Normal',
          quality: 'Qualité',
          loop: 'En boucle',
        }
      }}
    />
  );
}
