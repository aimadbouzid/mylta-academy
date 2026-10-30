import { useState } from 'react'
import { Instagram } from 'lucide-react'

// Publications Instagram de l'académie, montrées sur l'accueil.
// Instagram interdit à ses vidéos de se lire dans un autre site : son cadre
// intégré affiche « Watch on Instagram » et emmène le visiteur ailleurs. On
// montre donc l'image de chaque publication, hébergée ici, et un appui ouvre
// la publication d'origine — compte et lien exacts.

const TAGS = [
  { id: 'all', label: 'Tout' },
  { id: 'etudiant', label: 'Fait par nos étudiants' },
  { id: 'resultat', label: 'Fait au téléphone' },
  { id: 'temoignage', label: 'Témoignages' },
  { id: 'formation', label: 'En formation' },
]
const TAG_LABEL = {
  etudiant: 'Fait par un étudiant',
  resultat: 'Fait au téléphone',
  temoignage: 'Témoignage',
  formation: 'En formation',
  ia: 'IA',
}

export default function InstagramFeed({ instagram }) {
  const [tag, setTag] = useState('all')
  if (!instagram?.enabled || !(instagram.posts || []).length) return null

  const shown = TAGS.filter(t => t.id === 'all' || instagram.posts.some(p => p.tag === t.id))
  const posts = tag === 'all' ? instagram.posts : instagram.posts.filter(p => p.tag === tag)

  return (
    <section className="py-8 lg:py-12 border-t border-academy-border">
      <div className="section-container">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-primary">En vrai, pas en promesse</p>
            <h2 className="mt-1 font-display font-black text-2xl sm:text-3xl tracking-tight text-academy-textMain">
              Nos formations et nos étudiants
            </h2>
            <p className="mt-1.5 text-[15px] text-academy-textMain/60 max-w-xl">
              Chaque vidéo a été tournée et montée avec un téléphone. Appuyez pour la voir sur Instagram.
            </p>
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
          {posts.map(p => (
            <a key={p.code} href={`https://www.instagram.com/p/${p.code}/`} target="_blank" rel="noopener noreferrer"
               className="group snap-start shrink-0 w-[150px] sm:w-[185px]">
              <div className="relative rounded-xl overflow-hidden border border-academy-border bg-black aspect-[9/16]">
                <img src={`/instagram/${p.code}.jpg`} alt={`Publication de @${p.account || instagram.account}`}
                     loading="lazy" decoding="async"
                     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <div className="absolute inset-x-0 bottom-0 p-2.5 pt-10 bg-gradient-to-t from-black/85 to-transparent">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/75">Créée avec un téléphone</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] font-bold text-white">
                    <Instagram size={12} className="shrink-0" /> @{p.account || instagram.account}
                  </p>
                </div>
              </div>
              {p.tag && TAG_LABEL[p.tag] && (
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-academy-primary">{TAG_LABEL[p.tag]}</p>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
