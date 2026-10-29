import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// Lecteur des vidéos du fil, pensé pour le téléphone.
// Trois règles pour que ce soit rapide et fluide sur Android comme sur iPhone :
//   · `playsInline` — sans lui, iOS ouvre la vidéo en plein écran et coupe la page ;
//   · démarrage sans le son — les navigateurs refusent la lecture automatique sonore ;
//   · une seule vidéo joue à la fois, celle qui est à l'écran : les autres sont mises
//     en pause et ne téléchargent rien, donc pas de saccade ni de forfait gaspillé.

export default function ReelPlayer({ src, poster, className = '' }) {
  const ref = useRef(null)
  const [near, setNear] = useState(false)   // assez proche pour précharger
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  // Précharge juste avant l'arrivée à l'écran, puis joue dès que la vidéo est visible.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const preload = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '600px' })
    const play = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const v = el.querySelector('video')
        v?.play().then(() => setPlaying(true)).catch(() => {})
      } else {
        const v = el.querySelector('video')
        v?.pause()
        setPlaying(false)
      }
    }, { threshold: 0.6 })
    preload.observe(el)
    play.observe(el)
    return () => { preload.disconnect(); play.disconnect() }
  }, [near])

  // Mettre en pause quand l'onglet passe à l'arrière-plan.
  useEffect(() => {
    const onHide = () => { if (document.hidden) ref.current?.querySelector('video')?.pause() }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [])

  const toggleSound = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const v = ref.current?.querySelector('video')
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (v.paused) v.play().catch(() => {})
  }

  return (
    <div ref={ref} className={`relative overflow-hidden bg-black ${className}`}>
      {near ? (
        <video
          src={src}
          poster={poster}
          muted={muted}
          loop
          playsInline
          autoPlay
          preload="metadata"
          disablePictureInPicture
          controls={false}
          className="w-full h-full object-cover"
          onPlaying={() => setPlaying(true)}
        />
      ) : (
        poster && <img src={poster} alt="" loading="lazy" className="w-full h-full object-cover" />
      )}

      <button type="button" onClick={toggleSound}
              aria-label={muted ? 'Activer le son' : 'Couper le son'}
              className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-black/55 text-white flex items-center justify-center backdrop-blur-sm">
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {!playing && near && (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <span className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        </span>
      )}
    </div>
  )
}
