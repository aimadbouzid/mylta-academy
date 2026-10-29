import { useEffect, useRef, useState } from 'react'
import { Instagram, Play } from 'lucide-react'
import ReelPlayer from './ReelPlayer'

// Publications Instagram de l'académie, montrées sur l'accueil.
// L'intégration officielle d'Instagram n'est chargée que lorsque la carte
// approche de l'écran : dix cadres chargés d'un coup rendraient la page lourde.

const TAGS = [
  { id: 'all', label: 'Tout' },
  { id: 'formation', label: 'En formation' },
  { id: 'temoignage', label: 'Témoignages' },
  { id: 'ia', label: 'IA' },
]
const TAG_LABEL = { formation: 'En formation', temoignage: 'Témoignage', ia: 'IA' }

function Post({ code, tag, video, poster, hidden }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '400px' })
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  return (
    <article ref={ref} className={`snap-start shrink-0 w-[270px] sm:w-[300px] ${hidden ? 'hidden' : ''}`}>
      <div className="relative rounded-xl overflow-hidden border border-academy-border bg-white h-[440px]">
        {/* Vidéo hébergée ici : elle démarre seule, sans attendre Instagram. */}
        {video ? (
          <a href={`https://www.instagram.com/p/${code}/`} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <ReelPlayer src={video} poster={poster} className="w-full h-full" />
          </a>
        ) : visible ? (
          <iframe
            src={`https://www.instagram.com/p/${code}/embed/`}
            title={`Publication Instagram ${code}`}
            loading="lazy"
            scrolling="no"
            allowTransparency="true"
            className="w-full h-full border-0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-academy-textMain/30">
            <Play size={28} />
          </div>
        )}
      </div>
      {tag && TAG_LABEL[tag] && (
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.15em] text-academy-primary">{TAG_LABEL[tag]}</p>
      )}
    </article>
  )
}

export default function InstagramFeed({ instagram }) {
  const [tag, setTag] = useState('all')
  if (!instagram?.enabled || !(instagram.posts || []).length) return null

  const shown = TAGS.filter(t => t.id === 'all' || instagram.posts.some(p => p.tag === t.id))

  return (
    <section className="py-8 lg:py-12 border-t border-academy-border">
      <div className="section-container">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-primary">En vrai, pas en promesse</p>
            <h2 className="mt-1 font-display font-black text-2xl sm:text-3xl tracking-tight text-academy-textMain">
              Nos formations et nos étudiants
            </h2>
          </div>
          <a href={`https://www.instagram.com/${instagram.account}/`} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1.5 text-sm font-bold text-academy-textMain border-b-2 border-academy-textMain hover:text-academy-primary hover:border-academy-primary transition-colors">
            <Instagram size={15} /> @{instagram.account}
          </a>
        </div>

        {shown.length > 2 && (
          <div className="mt-4 flex gap-1.5 overflow-x-auto hide-scrollbar">
            {shown.map(t => (
              <button key={t.id} type="button" onClick={() => setTag(t.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] font-bold border transition-colors ${
                        tag === t.id ? 'bg-academy-textMain text-academy-surface border-academy-textMain'
                                     : 'border-academy-border text-academy-textMain/65 hover:border-academy-textMain/40'}`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-1">
          {instagram.posts.map(p => (
            <Post key={p.code} code={p.code} tag={p.tag} video={p.video} poster={p.poster}
                  hidden={tag !== 'all' && p.tag !== tag} />
          ))}
        </div>
      </div>
    </section>
  )
}
