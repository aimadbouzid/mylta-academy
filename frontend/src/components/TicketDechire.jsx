// Le billet de réservation, déchiré.
//
// À la fin de l'inscription, on ne montre pas qu'une coche verte : on montre
// le billet, et la souche arrachée à côté. Le geste dit « c'est fait » mieux
// qu'une phrase, et le numéro d'inscription devient quelque chose qu'on garde.
//
// Tout est en CSS : pas d'image, pas de librairie, deux boîtes et un masque.
// Le bord déchiré est un masque en dents de scie, l'animation ne touche que
// `transform` et `opacity` — le navigateur la passe au compositeur, elle ne
// coûte rien à la page.

const DENT = '14px'

// Dents de scie : le bas du billet et le haut de la souche s'emboîtent.
const dentsBas = {
  WebkitMask: `conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 0 100%/${DENT} 100% repeat-x, linear-gradient(#000 0 0) 0 0/100% calc(100% - ${DENT}) no-repeat`,
  mask: `conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 0 100%/${DENT} 100% repeat-x, linear-gradient(#000 0 0) 0 0/100% calc(100% - ${DENT}) no-repeat`,
}
const dentsHaut = {
  WebkitMask: `conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) 0 0/${DENT} 100% repeat-x, linear-gradient(#000 0 0) 0 100%/100% calc(100% - ${DENT}) no-repeat`,
  mask: `conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) 0 0/${DENT} 100% repeat-x, linear-gradient(#000 0 0) 0 100%/100% calc(100% - ${DENT}) no-repeat`,
}

export default function TicketDechire({ numero, titre, date, lieu, nom }) {
  return (
    <div className="billet-dechire relative z-10 mb-2" aria-label={`Billet de réservation n° ${numero}`}>
      <div style={dentsBas}
           className="billet-haut relative bg-white border border-academy-border rounded-t-2xl
                      px-5 pt-5 pb-[26px] shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-academy-primary">
            Mylta Academy
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-academy-textMain/45">
            Place réservée
          </p>
        </div>

        <p className="mt-2 font-display font-black text-xl sm:text-2xl leading-tight tracking-tight">
          {titre}
        </p>

        {(date || lieu) && (
          <p className="mt-1.5 text-[13px] text-academy-textMain/65">
            {[date, lieu].filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-dashed border-academy-border pt-3">
          {nom && (
            <span className="min-w-0 truncate text-[13px] font-bold">{nom}</span>
          )}
          <span className="shrink-0 font-mono text-[13px] font-bold tabular-nums text-academy-textMain/70">
            N° {numero}
          </span>
        </div>
      </div>

      {/* La souche : arrachée, elle reste de travers. */}
      <div style={dentsHaut}
           className="billet-souche -mt-px bg-white border border-academy-border rounded-b-2xl
                      px-5 pt-[26px] pb-4 shadow-soft
                      flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-academy-textMain/40">
          Souche
        </span>
        <span className="font-mono text-[12px] font-bold tabular-nums text-academy-textMain/55">
          N° {numero}
        </span>
      </div>

      <style>{`
        .billet-dechire { perspective: 800px }
        .billet-haut { animation: billet-haut .6s cubic-bezier(.22,1,.36,1) both }
        .billet-souche { transform-origin: left top; animation: billet-souche .7s cubic-bezier(.22,1,.36,1) both }
        @keyframes billet-haut { from { transform: translateY(4px) } to { transform: translateY(0) } }
        @keyframes billet-souche {
          0%   { transform: translate(0,0) rotate(0deg) }
          55%  { transform: translate(10px, 7px) rotate(3.2deg) }
          100% { transform: translate(6px, 5px) rotate(2.2deg) }
        }
        @media (prefers-reduced-motion: reduce) {
          .billet-haut { animation: none }
          .billet-souche { animation: none; transform: translate(6px,5px) rotate(2.2deg) }
        }
      `}</style>
    </div>
  )
}
