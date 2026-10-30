import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// Lecteur des vidéos du fil, pensé pour le téléphone.
// Trois règles pour que ce soit rapide et fluide sur Android comme sur iPhone :
//   · `playsInline` — sans lui, iOS ouvre la vidéo en plein écran et coupe la page ;
//   · démarrage sans le son — les navigateurs refusent la lecture automatique sonore ;
//   · une seule vidéo joue à la fois, celle qui est à l'écran : les autres sont mises
//     en pause et ne téléchargent rien, donc pas de saccade ni de forfait gaspillé.

// Trois barres défilent en même temps : sans garde-fou, une dizaine de vidéos
// se décoderaient d'un coup et le téléphone chaufferait. On en laisse jouer
// quatre au plus ; les autres gardent leur image et auront leur tour en
// repassant à l'écran.
const MAX_EN_LECTURE = 3
const enLecture = new Set()

// Vignettes visibles qui attendent une place. Sans cette file, une vidéo
// arrivée alors que les trois places étaient prises restait figée sur son
// image tant qu'on ne la sortait pas puis ne la ramenait pas à l'écran — on
// croyait la vidéo cassée. Dès qu'une place se libère, la suivante démarre.
const enAttente = new Set()

function libererPlace(el) {
  if (!enLecture.delete(el)) return
  for (const reprendre of [...enAttente]) {
    if (enLecture.size >= MAX_EN_LECTURE) break
    reprendre()
  }
}

export default function ReelPlayer({ src, poster, className = '' }) {
  const ref = useRef(null)
  const [near, setNear] = useState(false)   // assez proche pour précharger
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const visible = useRef(false)

  // Tente la lecture si la vignette est à l'écran et qu'une place est libre.
  const tenterLecture = useRef(() => {})
  tenterLecture.current = () => {
    const el = ref.current
    const v = el?.querySelector('video')
    if (!v || !visible.current || enLecture.has(el) || enLecture.size >= MAX_EN_LECTURE) return
    enLecture.add(el)
    v.play().then(() => setPlaying(true)).catch(() => libererPlace(el))
  }

  // Inscrite dans la file d'attente tant que la vignette est montée.
  useEffect(() => {
    const reprendre = () => tenterLecture.current()
    enAttente.add(reprendre)
    return () => enAttente.delete(reprendre)
  }, [])

  // La balise vidéo n'existe que près de l'écran, et disparaît dès qu'on s'en
  // éloigne : c'est ce qui évite d'avoir quatre-vingts décodeurs ouverts en même
  // temps quand les barres défilent. L'affiche prend le relais, on ne voit rien.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const preload = new IntersectionObserver(([e]) => {
      setNear(e.isIntersecting)
      if (!e.isIntersecting) { visible.current = false; libererPlace(el); setPlaying(false) }
    }, { rootMargin: '200px' })
    const play = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting
      if (e.isIntersecting) {
        tenterLecture.current()
      } else {
        libererPlace(el)
        el.querySelector('video')?.pause()
        setPlaying(false)
      }
    }, { threshold: 0.45 })
    preload.observe(el)
    play.observe(el)
    return () => { preload.disconnect(); play.disconnect(); libererPlace(el) }
  }, [])

  // La balise vient d'apparaître : si la carte est déjà à l'écran, l'observateur
  // ne se déclenchera plus, donc on tente la lecture ici.
  useEffect(() => {
    const el = ref.current
    if (!near || !el?.querySelector('video')) return
    const r = el.getBoundingClientRect()
    if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return
    visible.current = true
    tenterLecture.current()
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

      {!playing && near && !poster && (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <span className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        </span>
      )}
    </div>
  )
}
