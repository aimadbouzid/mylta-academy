import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { PAPIER, ENCRE, ROUGE, fondPapier, TITRE, SERIF, MONO } from '../lib/papier'
import { getSessions } from '../api/sessions'

// Annonce de la formation, dessinée comme un billet d'évènement imprimé :
// papier crème tramé, souche rouge « ENTRÉE » sur la tranche, bords dentelés,
// et un talon détachable à droite qui porte la date, le prix et la réservation.
//
// Les couleurs du billet ne suivent pas le thème du site : un billet est un
// objet posé sur la page, comme une photo. Il reste donc en papier clair,
// y compris en thème sombre, où il ressort d'autant mieux.

const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1)
const hour = (t) => (t || '').replace(':', 'h')

export default function FormationAd({ inPerson }) {
  const [session, setSession] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!inPerson?.enabled) return
    getSessions()
      .then(list => setSession(list.find(s => s.seatsLeft > 0) || null))
      .catch(() => {})
  }, [inPerson?.enabled])

  useEffect(() => {
    if (!session) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [session])

  if (!inPerson?.enabled || !session) return null

  const [y, m, d] = session.date.split('-').map(Number)
  const days = [0, 1, 2].map(i => new Date(y, m - 1, d + i))
  const month = cap(days[2].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })).toUpperCase()
  const price = Number(session.price) || Number(inPerson.price) || 0
  const oldPrice = Number(inPerson.oldPrice) > price ? Number(inPerson.oldPrice) : 0
  const remise = oldPrice > 0 ? Math.round((1 - price / oldPrice) * 100) : 0

  let left = Math.max(0, new Date(`${session.date}T${session.startTime || '08:30'}:00+01:00`) - now)
  const j = Math.floor(left / 86400000); left -= j * 86400000
  const h = Math.floor(left / 3600000);  left -= h * 3600000
  const mn = Math.floor(left / 60000)
  const pad = (n) => String(n).padStart(2, '0')


  return (
    <section className="section-container pt-3">
      <article
        className="relative mx-auto max-w-3xl lg:max-w-none overflow-hidden rounded-[3px] shadow-soft-lg"
        style={fondPapier}
      >
        <div className="flex">
          {/* Souche d'entrée, sur la tranche. */}
          <div className="relative shrink-0 w-8 sm:w-11 flex items-center justify-center"
               style={{ background: ROUGE, color: PAPIER }}>
            <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">
              Entrée
            </span>
            <span aria-hidden="true" className="absolute inset-y-0 right-0 border-r border-dashed"
                  style={{ borderColor: `${PAPIER}66` }} />
          </div>

          <div className="flex-1 min-w-0 flex flex-col lg:flex-row">
            {/* Corps du billet */}
            <div className="flex-1 min-w-0 px-4 sm:px-6 py-4 sm:py-6">
              <p className="text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.18em] opacity-65" style={MONO}>
                Mylta Academy — Présentiel
              </p>

              <h2 className="mt-2.5 uppercase leading-[0.92] tracking-[0.01em] text-[1.5rem] sm:text-[2.6rem] lg:text-[3.1rem]"
                  style={TITRE}>
                3 jours pour filmer,<br />
                monter &amp;{' '}
                <span className="normal-case tracking-normal" style={{ ...SERIF, color: ROUGE }}>dompter l'IA</span>
              </h2>


              <p className="mt-3.5 pt-3 text-[12px] sm:text-[14px] uppercase"
                 style={{ ...TITRE, borderTop: `1.5px solid ${ENCRE}` }}>
                {hour(session.startTime)} – {hour(session.endTime)}
                <span className="mx-2 opacity-40">·</span>
                {session.place || 'Camden Int. Institute'}
              </p>
            </div>

            {/* Talon détachable : la date, le prix, la réservation. */}
            <div className="relative shrink-0 lg:w-[270px] px-4 sm:px-6 py-4 sm:py-6
                            border-t-2 lg:border-t-0 lg:border-l-2 border-dashed"
                 style={{ borderColor: `${ENCRE}55` }}>
              <div className="flex items-start justify-between gap-3 lg:block">
                <div>
                  <div className="flex" style={{ border: `1.5px solid ${ENCRE}` }}>
                    {days.map((dt, i) => (
                      <div key={i} className="px-2.5 sm:px-3 py-1 text-center"
                           style={i ? { borderLeft: `1.5px solid ${ENCRE}` } : undefined}>
                        <span className="block text-[1.35rem] sm:text-[1.6rem] leading-none" style={TITRE}>
                          {dt.getDate()}
                        </span>
                        <span className="block mt-0.5 text-[8px] uppercase tracking-[0.15em] opacity-60" style={MONO}>
                          {dt.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[9.5px] uppercase tracking-[0.25em] opacity-65" style={MONO}>{month}</p>
                </div>

                {/* Tampon de remise, posé de travers comme à l'encre. */}
                {remise > 0 && (
                  <span className="lg:hidden shrink-0 -rotate-6 px-2 py-0.5 text-[12px] font-black"
                        style={{ color: ROUGE, border: `2px solid ${ROUGE}` }}>
                    −{remise}%
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-end justify-between gap-3 lg:block">
                <div>
                  {oldPrice > 0 && (
                    <p className="text-[12px] line-through opacity-50 tracking-[0.1em]" style={MONO}>
                      {oldPrice.toLocaleString('fr-FR')} DA
                    </p>
                  )}
                  <p className="leading-none" style={TITRE}>
                    <span className="text-[2.1rem] sm:text-[2.5rem]">{price.toLocaleString('fr-FR')}</span>
                    <span className="ms-1 text-[1rem]">DA</span>
                  </p>
                </div>
                {remise > 0 && (
                  <span className="hidden lg:inline-block absolute top-5 right-5 -rotate-6 px-2 py-0.5 text-[13px] font-black"
                        style={{ color: ROUGE, border: `2px solid ${ROUGE}` }}>
                    −{remise}%
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-[10px] tracking-[0.08em] opacity-60" style={MONO}>
                Dans {j} j {pad(h)} h {pad(mn)} min
              </p>

              {/* Bouton en rouge de marque plutôt qu'en noir : sur un papier crème,
                  le noir pèse comme un pavé d'encre alors que le rouge éclaire le
                  billet et reprend la souche « Entrée ». Le reflet qui traverse
                  accroche l'œil sans clignoter. */}
              <Link to="/coaching-presentiel"
                    className="billet-reserver mt-2.5 block w-full text-center uppercase
                               text-[14px] sm:text-[15px] tracking-[0.12em] py-2.5"
                    style={{ ...TITRE, background: ROUGE, color: PAPIER }}>
                Réserver
              </Link>

              {/* Code-barres : des barres de largeurs irrégulières, dessinées en CSS. */}
              <div aria-hidden="true" className="mt-3 hidden lg:flex flex-col items-center gap-1">
                <span className="block h-7 w-full max-w-[180px]" style={{
                  color: ENCRE,
                  backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 4px, currentColor 4px 5px, transparent 5px 9px, currentColor 9px 12px, transparent 12px 14px)',
                }} />
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}
