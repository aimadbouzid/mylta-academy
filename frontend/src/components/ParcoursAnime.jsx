// La carte du parcours, en page de bande dessinée.
//
// La question que tout le monde se pose avant de payer — « je ressors avec
// quoi ? » — mérite mieux qu'une liste à puces. Quatre cases, des bulles, et
// la dernière qui montre la personne qu'on est devenue le dimanche soir.
//
// La page est en papier dans les deux thèmes : une BD collée sur le site,
// pas un bloc qui change de couleur. Les dessins sont des SVG tracés ici —
// pas une image, pas une requête. Seul le lettrage ajoute une police
// (Bangers), chargée avec les autres dans index.html.
//
// Rien ne s'anime avant que la carte soit à l'écran, et les animations ne
// touchent que `transform` et `opacity` : le défilement reste fluide.

import { useEffect, useRef, useState } from 'react'

// Palette d'encre et de papier, fixe : une BD ne change pas de couleurs.
const INK = '#15181B'
const ROUGE = '#C8322F'
const JAUNE = '#F5C13D'
const BLEU = '#5B9BD5'
const PEAU = '#F3C9A4'
const PAPIER = '#FFFDF6'

const o = { stroke: INK, strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
const trait = { ...o, fill: 'none' }

// ── Les dessins ────────────────────────────────────────────────────────────

// Case 1 — avachi sur son téléphone, ça ne rend rien.
const DessinAvant = () => (
  <svg viewBox="0 0 96 72" className="h-full w-full" aria-hidden="true">
    <ellipse cx="46" cy="66" rx="26" ry="3.5" fill={INK} opacity=".12" />
    {/* corps */}
    <path d="M34 64c-1-12 1-20 10-22 9-2 15 4 16 13l1 9z" fill={BLEU} {...o} />
    {/* bras vers le téléphone */}
    <path d="M58 48l10 4" {...trait} strokeWidth="5" />
    {/* tête penchée */}
    <g transform="rotate(12 44 28)">
      <circle cx="44" cy="28" r="13" fill={PEAU} {...o} />
      <path d="M32 24c2-9 20-11 24-2 1 3 0 5 0 5-2-5-20-7-24-3z" fill={INK} />
      <circle cx="39" cy="30" r="1.9" fill={INK} />
      <circle cx="49" cy="30" r="1.9" fill={INK} />
      <path d="M40 37c3-2 6-2 8 0" {...trait} />
    </g>
    {/* téléphone, image de travers */}
    <g transform="rotate(14 74 46)">
      <rect x="66" y="31" width="17" height="28" rx="3" fill={INK} />
      <rect x="68.5" y="34" width="12" height="22" rx="1.5" fill="#CFD6DB" />
      <path d="M70 50l4-6 3 4 3-5" stroke={ROUGE} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
    {/* goutte de sueur + grognement */}
    <path d="M26 20c3 4 3 6 0 6s-3-2 0-6z" fill={BLEU} {...o} strokeWidth="2" />
    <path d="M62 14c3-3 5 2 8-1" {...trait} strokeWidth="2.2" stroke={ROUGE} />
  </svg>
)

// Case 2 — le téléphone sur pied, la lumière, et on tourne.
const DessinFilmer = () => (
  <svg viewBox="0 0 96 72" className="h-full w-full" aria-hidden="true">
    <ellipse cx="48" cy="66" rx="30" ry="3.5" fill={INK} opacity=".12" />
    {/* soleil */}
    <circle cx="78" cy="16" r="8" fill={JAUNE} {...o} />
    <path d="M78 3v-0M90 16h4M88 6l3-3M88 26l3 3" {...trait} strokeWidth="2.4" />
    {/* trépied */}
    <path d="M30 44v8M30 52l-9 12M30 52l9 12" {...trait} strokeWidth="3.4" />
    {/* téléphone */}
    <rect x="18" y="10" width="24" height="34" rx="4" fill={INK} />
    <rect x="21" y="13" width="18" height="28" rx="2" fill={PAPIER} />
    <circle cx="30" cy="27" r="6" fill={BLEU} {...o} strokeWidth="2" />
    {/* personnage filmé, bras levé */}
    <circle cx="62" cy="36" r="10" fill={PEAU} {...o} />
    <path d="M52 33c2-8 18-9 20-1 0 0 1-9-10-9s-10 10-10 10z" fill={INK} />
    <circle cx="58" cy="37" r="1.8" fill={INK} />
    <circle cx="66" cy="37" r="1.8" fill={INK} />
    <path d="M58 42c3 3 6 3 9 0" {...trait} />
    <path d="M62 46v12" {...trait} strokeWidth="5" />
    <path d="M62 50l8-6" {...trait} strokeWidth="4.5" />
  </svg>
)

// Case 3 — le montage, et l'IA qui s'en mêle.
const DessinMonter = () => (
  <svg viewBox="0 0 96 72" className="h-full w-full" aria-hidden="true">
    <ellipse cx="48" cy="66" rx="30" ry="3.5" fill={INK} opacity=".12" />
    <rect x="10" y="12" width="60" height="42" rx="5" fill={INK} />
    <rect x="14" y="16" width="52" height="34" rx="3" fill={PAPIER} />
    <rect x="18" y="21" width="30" height="7" rx="2" fill={BLEU} {...o} strokeWidth="2" />
    <rect x="18" y="31" width="42" height="7" rx="2" fill={JAUNE} {...o} strokeWidth="2" />
    <rect x="18" y="41" width="20" height="5" rx="2" fill={ROUGE} {...o} strokeWidth="2" />
    <path d="M52 12v44" stroke={ROUGE} strokeWidth="2.6" strokeLinecap="round" />
    <circle cx="52" cy="12" r="3.4" fill={ROUGE} {...o} strokeWidth="2" />
    {/* étincelles de l'IA */}
    <path d="M80 18l2.6 6.4L89 27l-6.4 2.6L80 36l-2.6-6.4L71 27l6.4-2.6z" fill={JAUNE} {...o} strokeWidth="2" />
    <path d="M76 46l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill={ROUGE} {...o} strokeWidth="1.8" />
  </svg>
)

// Case 4 — la vidéo part, et elle rapporte.
const DessinPayer = () => (
  <svg viewBox="0 0 96 72" className="h-full w-full" aria-hidden="true">
    <ellipse cx="46" cy="66" rx="28" ry="3.5" fill={INK} opacity=".12" />
    <rect x="12" y="10" width="34" height="50" rx="5" fill={INK} />
    <rect x="16" y="14" width="26" height="42" rx="3" fill={PAPIER} />
    <path d="M20 46l7-12 6 7 8-16" stroke={ROUGE} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M35 25h6v6" stroke={ROUGE} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* pièces qui montent */}
    <circle cx="68" cy="44" r="12" fill={JAUNE} {...o} />
    <path d="M68 37v14M64.5 40.5h5a2.8 2.8 0 010 5.6h-3.5a2.8 2.8 0 000 5.6h5" {...trait} strokeWidth="2.2" />
    <circle cx="82" cy="24" r="7" fill={JAUNE} {...o} strokeWidth="2.2" />
    <circle cx="72" cy="13" r="4.5" fill={JAUNE} {...o} strokeWidth="2" />
  </svg>
)

// Case finale — debout, le certificat en main.
const DessinApres = () => (
  <svg viewBox="0 0 96 72" className="h-full w-full" aria-hidden="true">
    <ellipse cx="44" cy="67" rx="24" ry="3.5" fill={INK} opacity=".12" />
    <path d="M34 65c-2-14 0-22 10-22s12 8 10 22z" fill={ROUGE} {...o} />
    <circle cx="44" cy="25" r="13" fill={PEAU} {...o} />
    <path d="M31 22c3-10 22-11 26-1 0 0 2-13-13-13S31 22 31 22z" fill={INK} />
    <circle cx="39" cy="26" r="2" fill={INK} />
    <circle cx="49" cy="26" r="2" fill={INK} />
    <path d="M38 32c4 5 10 5 13 0" fill={PAPIER} {...o} strokeWidth="2.2" />
    {/* bras levé + certificat */}
    <path d="M34 48l-10-10" {...trait} strokeWidth="5" />
    <path d="M54 48l12 2" {...trait} strokeWidth="5" />
    <g transform="rotate(-8 76 44)">
      <rect x="64" y="34" width="26" height="19" rx="2" fill={PAPIER} {...o} />
      <path d="M69 40h14M69 45h9" {...trait} strokeWidth="2" opacity=".55" />
      <circle cx="85" cy="48" r="3.4" fill={ROUGE} {...o} strokeWidth="1.8" />
    </g>
    {/* confettis */}
    <path d="M16 14l3 5M24 8l1 6M10 26l5 2" stroke={JAUNE} strokeWidth="3" strokeLinecap="round" />
    <path d="M86 12l-4 4" stroke={BLEU} strokeWidth="3" strokeLinecap="round" />
  </svg>
)

// ── Les cases ──────────────────────────────────────────────────────────────

const CASES = [
  {
    badge: 'Avant',
    bulle: 'Bon… ça fait amateur.',
    titre: 'Tu filmes déjà',
    texte: "Ça bouge, le son est mauvais, et le résultat ne ressemble jamais à ce que tu avais en tête.",
    Dessin: DessinAvant,
  },
  {
    badge: 'Jour 1',
    bulle: 'Action !',
    titre: 'Filmer comme un pro',
    texte: 'Lumière, cadrage, son, stabilité. Le soir même, tu tournes des images propres, sans matériel.',
    Dessin: DessinFilmer,
  },
  {
    badge: 'Jour 2',
    bulle: "L'IA bosse pour toi.",
    titre: 'Monter, et faire travailler l’IA',
    texte: "CapCut au rythme, sous-titres, étalonnage. Et l'IA qui écrit tes scripts et pose ta voix off.",
    Dessin: DessinMonter,
  },
  {
    badge: 'Jour 3',
    bulle: 'Un client !',
    titre: 'Publier, être vu, être payé',
    texte: 'Le hook, les algorithmes, le contenu UGC, tes prix, et où trouver ton premier client.',
    Dessin: DessinPayer,
  },
]

const DEVIENS = [
  'Quelqu’un qui tourne et monte une vidéo propre, seul, au téléphone',
  'Quelqu’un qui ose se filmer face caméra et qui sait quoi dire',
  'Quelqu’un qui comprend pourquoi une vidéo monte, et pourquoi une autre reste à zéro',
]

const REPARS = [
  'Ton certificat, remis à l’atelier final',
  'Ton portfolio, monté pendant les trois jours',
  'Dix modèles de hooks et la check-list avant publication',
  'Le suivi gratuit après la formation',
]

const ETOILE = 'polygon(50% 0%, 58.5% 18.1%, 75% 6.7%, 73.3% 26.7%, 93.3% 25%, 81.9% 41.5%, 100% 50%, 81.9% 58.5%, 93.3% 75%, 73.3% 73.3%, 75% 93.3%, 58.5% 81.9%, 50% 100%, 41.5% 81.9%, 25% 93.3%, 26.7% 73.3%, 6.7% 75%, 18.1% 58.5%, 0% 50%, 18.1% 41.5%, 6.7% 25%, 26.7% 26.7%, 25% 6.7%, 41.5% 18.1%)'

export default function ParcoursAnime() {
  const ref = useRef(null)
  const [vu, setVu] = useState(false)

  // Les cases n'arrivent que quand on y est : plus bas dans la page, elles ne
  // coûtent rien pendant qu'on lit le reste.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setVu(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVu(true); io.disconnect() } },
      { rootMargin: '0px 0px -10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={ref} className={`bd mt-4 ${vu ? 'bd-vu' : ''}`}>
      <header className="bd-entete">
        <span className="bd-etiquette">Le parcours</span>
        <h2 className="bd-titre">De toi aujourd’hui<br />à toi dimanche soir</h2>
      </header>

      <ol className="bd-cases">
        {CASES.map(({ badge, bulle, titre, texte, Dessin }, i) => (
          <li key={badge} className="bd-case" style={{ '--i': i }}>
            <span className="bd-badge" style={{ clipPath: ETOILE }}>{badge}</span>
            <div className="bd-vignette"><Dessin /></div>
            <span className="bd-bulle">{bulle}</span>
            <h3 className="bd-case-titre">{titre}</h3>
            <p className="bd-case-texte">{texte}</p>
          </li>
        ))}
      </ol>

      <div className="bd-final">
        <div className="bd-final-dessin"><DessinApres /></div>
        <div className="bd-final-texte">
          <p className="bd-boum">Ça y est !</p>
          <p className="bd-final-soustitre">À la fin des trois jours</p>
          <div className="bd-listes">
            {[['Tu deviens', DEVIENS], ['Tu repars avec', REPARS]].map(([t, lignes]) => (
              <div key={t}>
                <p className="bd-liste-titre">{t}</p>
                <ul>
                  {lignes.map(l => <li key={l}>{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .bd {
          --ink: ${INK}; --papier: ${PAPIER}; --rouge: ${ROUGE}; --jaune: ${JAUNE};
          position: relative;
          border: 3px solid var(--ink);
          border-radius: 18px;
          background-color: var(--papier);
          /* la trame : des points d'imprimerie, très pâles */
          background-image: radial-gradient(rgba(21,24,27,.16) 1px, transparent 1.2px);
          background-size: 14px 14px;
          box-shadow: 7px 7px 0 var(--ink);
          padding: 20px 16px 22px;
          color: var(--ink);
        }
        @media (min-width: 640px) { .bd { padding: 26px 22px 28px } }

        .bd-entete { text-align: center; margin-bottom: 18px }
        .bd-etiquette {
          display: inline-block;
          font-family: Bangers, Archivo, system-ui, sans-serif;
          letter-spacing: .12em;
          font-size: 14px; line-height: 1;
          color: #fff; background: var(--rouge);
          border: 2.5px solid var(--ink);
          padding: 7px 14px 5px;
          transform: rotate(-2.5deg);
          box-shadow: 3px 3px 0 var(--ink);
        }
        .bd-titre {
          margin-top: 12px;
          font-family: Bangers, Archivo, system-ui, sans-serif;
          font-size: clamp(28px, 7vw, 46px);
          line-height: .98;
          letter-spacing: .015em;
          text-transform: uppercase;
          /* contour d'encre autour des lettres, comme un titre de couverture */
          text-shadow: 2px 2px 0 var(--jaune), 4px 4px 0 var(--ink);
        }

        .bd-cases { display: grid; gap: 22px }
        @media (min-width: 1024px) { .bd-cases { grid-template-columns: repeat(4, 1fr); gap: 16px } }

        .bd-case {
          position: relative;
          background: #fff;
          border: 3px solid var(--ink);
          border-radius: 12px;
          box-shadow: 5px 5px 0 var(--ink);
          padding: 16px 14px 14px;
          opacity: 0; transform: translateY(14px) rotate(0deg);
        }
        .bd-case:nth-child(odd)  { rotate: -.7deg }
        .bd-case:nth-child(even) { rotate: .7deg }

        .bd-badge {
          position: absolute; top: -16px; left: -10px; z-index: 2;
          display: grid; place-items: center;
          width: 62px; height: 62px;
          background: var(--jaune);
          color: var(--ink);
          font-family: Bangers, Archivo, system-ui, sans-serif;
          font-size: 14px; line-height: 1; text-align: center;
          letter-spacing: .04em;
          rotate: -10deg;
        }

        .bd-vignette {
          position: relative;
          border: 2.5px solid var(--ink);
          border-radius: 8px;
          background:
            radial-gradient(circle at 50% 120%, ${JAUNE}55, transparent 60%),
            #F2F5F7;
          padding: 6px;
          height: 104px;
        }
        .bd-bulle {
          position: relative; display: inline-block; margin-top: 14px;
          background: #fff; color: var(--ink);
          border: 2.5px solid var(--ink);
          border-radius: 14px;
          padding: 5px 11px 4px;
          font-size: 12.5px; font-weight: 800; line-height: 1.15;
          box-shadow: 2px 2px 0 var(--ink);
        }
        /* la queue pointe vers le dessin, juste au-dessus */
        .bd-bulle::after {
          content: ''; position: absolute; left: 18px; top: -8px;
          width: 12px; height: 12px; background: #fff;
          border-left: 2.5px solid var(--ink); border-top: 2.5px solid var(--ink);
          transform: rotate(45deg) skew(-8deg, -8deg);
        }

        .bd-case-titre {
          margin-top: 10px;
          font-family: Bangers, Archivo, system-ui, sans-serif;
          font-size: 20px; line-height: 1.05; letter-spacing: .02em;
        }
        .bd-case-texte { margin-top: 6px; font-size: 13px; line-height: 1.35; opacity: .78 }

        .bd-final {
          margin-top: 26px;
          display: grid; gap: 14px;
          grid-template-columns: 1fr;
          align-items: start;
          background: var(--jaune);
          border: 3px solid var(--ink);
          border-radius: 14px;
          box-shadow: 5px 5px 0 var(--ink);
          padding: 16px 14px;
          opacity: 0; transform: translateY(14px);
        }
        @media (min-width: 640px) { .bd-final { grid-template-columns: 120px 1fr; gap: 18px; padding: 20px } }
        .bd-final-dessin {
          height: 96px;
          background: #fff;
          border: 2.5px solid var(--ink); border-radius: 10px;
          padding: 6px;
          rotate: -1.5deg;
        }
        .bd-boum {
          display: inline-block;
          font-family: Bangers, Archivo, system-ui, sans-serif;
          font-size: clamp(26px, 6vw, 36px); line-height: 1;
          color: var(--rouge);
          text-shadow: 2px 2px 0 #fff, 4px 4px 0 var(--ink);
          rotate: -2deg;
        }
        .bd-final-soustitre {
          margin-top: 8px;
          font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .16em;
          opacity: .6;
        }
        .bd-listes { display: grid; gap: 14px; margin-top: 10px }
        @media (min-width: 640px) { .bd-listes { grid-template-columns: 1fr 1fr; gap: 18px } }
        .bd-liste-titre {
          font-family: Bangers, Archivo, system-ui, sans-serif;
          font-size: 17px; letter-spacing: .03em; color: var(--rouge);
          -webkit-text-stroke: .4px var(--ink);
        }
        .bd-listes ul { margin-top: 5px; display: grid; gap: 5px }
        .bd-listes li {
          position: relative; padding-left: 16px;
          font-size: 13px; line-height: 1.35; font-weight: 600;
        }
        .bd-listes li::before {
          content: ''; position: absolute; left: 0; top: 7px;
          width: 7px; height: 7px; background: var(--ink); border-radius: 2px; rotate: 45deg;
        }

        /* Entrée : les cases tombent une par une, comme on tourne une page. */
        .bd-vu .bd-case {
          animation: bd-tombe .45s cubic-bezier(.2,1.1,.4,1) both;
          animation-delay: calc(var(--i) * .1s);
        }
        .bd-vu .bd-final { animation: bd-tombe .45s cubic-bezier(.2,1.1,.4,1) .46s both }
        @keyframes bd-tombe {
          from { opacity: 0; transform: translateY(14px) scale(.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
        @media (prefers-reduced-motion: reduce) {
          .bd-case, .bd-final { opacity: 1; transform: none; animation: none !important }
        }
      `}</style>
    </section>
  )
}
