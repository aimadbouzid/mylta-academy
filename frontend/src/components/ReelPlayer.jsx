import { useEffect, useRef, useState } from 'react'
import { Play, Volume2, VolumeX } from 'lucide-react'

// Lecteur des vidéos de la galerie.
//
// Rien ne démarre tout seul : chaque vignette montre son image avec un bouton
// de lecture au centre, et la balise vidéo n'est créée qu'au clic. C'est le
// visiteur qui choisit ce qu'il regarde — et tant qu'il n'a rien choisi, le
// téléphone ne décode aucune vidéo, ne télécharge aucun fichier.
//
// Une seule vidéo joue à la fois : lancer la suivante arrête la précédente.

let enCours = null // { pause() } de la vignette qui joue

export default function ReelPlayer({ src, poster, className = '' }) {
  const ref = useRef(null)
  const [active, setActive] = useState(false)  // la balise vidéo est montée
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  const arreter = () => {
    ref.current?.querySelector('video')?.pause()
    setPlaying(false)
    setActive(false)
  }

  const lancer = () => {
    if (enCours && enCours !== arreter) enCours()
    enCours = arreter
    setActive(true)
    setPlaying(true)
  }

  // La balise vient d'être montée : on lance la lecture.
  useEffect(() => {
    if (!active) return
    const v = ref.current?.querySelector('video')
    v?.play().catch(() => setPlaying(false))
  }, [active])

  // Sortie d'écran ou onglet masqué : on arrête. Laisser tourner une vidéo
  // qu'on ne voit plus consomme de la batterie et des données pour rien.
  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return

    // L'observateur peut annoncer « hors écran » au moment même où la vidéo
    // vient d'être lancée (il livre toujours un premier état, et certains
    // navigateurs le donnent à faux quand l'onglet n'est pas peint). On
    // revérifie donc la position avant d'arrêter quoi que ce soit.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) return
      const r = el.getBoundingClientRect()
      const visible = r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth
      if (!visible) arreter()
    }, { threshold: 0.2 })
    io.observe(el)

    const onHide = () => { if (document.hidden) arreter() }
    document.addEventListener('visibilitychange', onHide)

    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onHide) }
  }, [active])

  useEffect(() => () => { if (enCours === arreter) enCours = null }, [])

  const basculerSon = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const v = ref.current?.querySelector('video')
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <div ref={ref} className={`relative overflow-hidden bg-black ${className}`}>
      {active ? (
        <video
          src={src}
          poster={poster}
          muted={muted}
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          className="w-full h-full object-cover"
          onClick={arreter}
          onPlaying={() => setPlaying(true)}
        />
      ) : (
        poster && <img src={poster} alt="" loading="lazy" decoding="async"
                       className="w-full h-full object-cover" />
      )}

      {/* Bouton de lecture, au centre. Il disparaît pendant la lecture pour
          laisser l'image tranquille, et revient si on met en pause. */}
      {!playing && (
        <button
          type="button"
          onClick={lancer}
          aria-label="Lire la vidéo"
          className="absolute inset-0 grid place-items-center group/play focus:outline-none"
        >
          <span className="grid place-items-center w-12 h-12 rounded-full
                           bg-white/90 text-black shadow-[0_4px_20px_rgba(0,0,0,0.45)]
                           backdrop-blur-sm transition-transform duration-200
                           group-hover/play:scale-110 group-active/play:scale-95">
            <Play size={19} strokeWidth={0} className="translate-x-[1px] fill-current" />
          </span>
        </button>
      )}

      {/* Le son ne se propose qu'une fois la vidéo lancée. */}
      {playing && (
        <button type="button" onClick={basculerSon}
                aria-label={muted ? 'Activer le son' : 'Couper le son'}
                className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-black/55 text-white
                           flex items-center justify-center backdrop-blur-sm">
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
    </div>
  )
}
