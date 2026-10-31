// Le billet de réservation, déchiré.
//
// À la fin de l'inscription, on ne montre pas qu'une coche verte : on montre
// le billet, et la souche arrachée en dessous. Le geste dit « c'est fait »
// mieux qu'une phrase, et le numéro d'inscription devient quelque chose qu'on
// garde — c'est la preuve qu'on montre à quelqu'un.
//
// Tout est en CSS : pas d'image, pas de librairie, pas une requête de plus.
// Le bord déchiré est un masque en dents de scie ; l'animation ne touche que
// `transform` et `opacity`, le navigateur la passe au compositeur.

const DENT = '11px'

// Dents de scie : le bas du billet et le haut de la souche s'emboîtent.
const dents = (bord) => {
  const cone = bord === 'bas'
    ? `conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 0 100%/${DENT} 100% repeat-x`
    : `conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) 0 0/${DENT} 100% repeat-x`
  const corps = bord === 'bas'
    ? `linear-gradient(#000 0 0) 0 0/100% calc(100% - ${DENT}) no-repeat`
    : `linear-gradient(#000 0 0) 0 100%/100% calc(100% - ${DENT}) no-repeat`
  return { WebkitMask: `${cone}, ${corps}`, mask: `${cone}, ${corps}` }
}

// Le papier : un blanc légèrement chaud, un peu plus clair en haut.
const PAPIER = 'bg-[linear-gradient(176deg,#ffffff_0%,#fdfbf8_55%,#f8f5f1_100%)]'

function Champ({ label, valeur, className = '' }) {
  if (!valeur) return null
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-academy-textMain/40">{label}</p>
      <p className="mt-0.5 text-[13.5px] font-bold leading-snug text-academy-textMain/85">{valeur}</p>
    </div>
  )
}

export default function TicketDechire({ numero, titre, date, heures, lieu, nom }) {
  return (
    <div className="billet-dechire relative z-10 mb-2" aria-label={`Billet de réservation n° ${numero}`}>
      <div style={dents('bas')}
           className={`billet-haut relative ${PAPIER} rounded-t-2xl pb-[22px]
                       shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]`}>
        {/* L'en-tête sombre : c'est ce qui fait « billet » et non « encadré ». */}
        <div className="flex items-center justify-between gap-3 rounded-t-2xl bg-academy-textMain px-5 py-2.5">
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-[3px] rounded-full bg-academy-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/90">Mylta Academy</span>
          </span>
          <span className="font-mono text-[11px] font-bold tabular-nums tracking-wider text-white/70">
            N° {numero}
          </span>
        </div>

        <div className="relative px-5 pt-4 sm:pe-32">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-academy-primary">
            Billet d'entrée · Présentiel
          </p>
          <p className="mt-1 font-display font-black text-[1.35rem] sm:text-[1.6rem] leading-[1.1] tracking-tight">
            {titre}
          </p>

          <div className="mt-3.5 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-dashed border-academy-border pt-3.5">
            <Champ label="Dates" valeur={date} className="col-span-2 sm:col-span-1" />
            <Champ label="Horaires" valeur={heures} />
            <Champ label="Lieu" valeur={lieu} />
            <Champ label="Au nom de" valeur={nom} />
          </div>

          {/* Le cachet : posé de travers, à moitié effacé, comme à la main. */}
          <span aria-hidden="true"
                className="pointer-events-none grid place-items-center absolute end-4 bottom-1 h-[64px] w-[64px]
                           sm:end-5 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:h-[84px] sm:w-[84px]
                           -rotate-[14deg] rounded-full border-2 sm:border-[2.5px]
                           border-academy-primary/30 text-center opacity-80">
            <span className="leading-tight">
              <span className="block text-[9.5px] sm:text-[12px] font-black uppercase tracking-[0.1em] text-academy-primary/55">Réservé</span>
              <span className="mt-0.5 block text-[6.5px] sm:text-[8px] font-bold uppercase tracking-[0.18em] text-academy-primary/40">Mylta</span>
            </span>
          </span>
        </div>
      </div>

      {/* La souche : arrachée, elle reste de travers sur la suite de la page. */}
      <div style={dents('haut')}
           className={`billet-souche -mt-px ${PAPIER} rounded-b-2xl px-5 pt-[22px] pb-3.5
                       shadow-[0_14px_30px_-20px_rgba(0,0,0,0.55)]
                       flex items-center justify-between gap-3`}>
        <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-academy-textMain/35">
          Souche · à garder
        </span>
        <span className="font-mono text-[12px] font-bold tabular-nums text-academy-textMain/50">
          N° {numero}
        </span>
      </div>

      <style>{`
        .billet-haut { animation: billet-haut .55s cubic-bezier(.22,1,.36,1) both }
        .billet-souche { transform-origin: left top; animation: billet-souche .8s cubic-bezier(.2,.9,.25,1) both }
        @keyframes billet-haut {
          0% { transform: translateY(5px) rotate(.6deg) }
          100% { transform: translateY(0) rotate(0deg) }
        }
        @keyframes billet-souche {
          0%   { transform: translate(0,0) rotate(0deg) }
          45%  { transform: translate(13px, 9px) rotate(3.6deg) }
          100% { transform: translate(7px, 6px) rotate(2.4deg) }
        }
        @media (prefers-reduced-motion: reduce) {
          .billet-haut { animation: none }
          .billet-souche { animation: none; transform: translate(7px,6px) rotate(2.4deg) }
        }
      `}</style>
    </div>
  )
}
