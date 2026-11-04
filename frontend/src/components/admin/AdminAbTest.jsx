// Résultats du test A/B sur l'affichage du prix.
//
// Le nombre d'inscriptions seul ne dit rien : si une version a reçu deux fois
// plus de visiteurs, elle aura plus d'inscriptions sans mieux transformer.
// C'est le taux — inscriptions ÷ visites — qui compare les deux, et il ne veut
// rien dire tant que les deux côtés n'ont pas assez de monde.

import { useState, useEffect, useCallback } from 'react'
import { FlaskConical, RefreshCw, Trophy, Eye, UserCheck, BadgeCheck } from 'lucide-react'
import api from '../../api/axios'

// En dessous, l'écart observé tient autant du hasard que de la page.
const VISITES_MINIMUM = 100
const INSCRIPTIONS_MINIMUM = 10

const pourcent = (v) => (v === null || v === undefined ? '—' : `${v.toFixed(1).replace('.', ',')} %`)

export default function AdminAbTest() {
  const [donnees, setDonnees] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  const charger = useCallback(() => {
    setChargement(true)
    api.get('/admin/in-person/ab')
      .then(({ data }) => { setDonnees(data); setErreur('') })
      .catch(() => setErreur("Les résultats n'ont pas pu être chargés."))
      .finally(() => setChargement(false))
  }, [])

  useEffect(() => { charger() }, [charger])

  const variantes = donnees?.variantes || []
  const assezDeDonnees = variantes.length === 2 && variantes.every(
    v => v.vues >= VISITES_MINIMUM && v.inscriptions >= INSCRIPTIONS_MINIMUM)

  const meilleure = assezDeDonnees
    ? [...variantes].sort((a, b) => (b.taux ?? -1) - (a.taux ?? -1))[0]
    : null
  const ecart = meilleure
    ? meilleure.taux - variantes.find(v => v.cle !== meilleure.cle).taux
    : null

  const tauxMax = Math.max(0.0001, ...variantes.map(v => v.taux || 0))

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-5">

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <FlaskConical size={18} className="text-amber-400" />
            Test A/B — affichage du prix
          </h3>
          <p className="text-neutral-400 text-sm mt-0.5">
            Un seul lien dans les publicités ; le site répartit les visiteurs moitié-moitié
            et chacun revoit toujours sa version.
          </p>
          <p className="font-mono text-[11px] text-neutral-500 mt-1">
            myltaacademy.com/coaching-presentiel
          </p>
        </div>
        <button type="button" onClick={charger} disabled={chargement}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-bold text-neutral-300 hover:text-white hover:border-neutral-500 disabled:opacity-50">
          <RefreshCw size={13} className={chargement ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {erreur && <p className="text-sm font-bold text-red-400">{erreur}</p>}

      {!erreur && chargement && !donnees && (
        <p className="text-sm text-neutral-500">Chargement des résultats…</p>
      )}

      {donnees && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {variantes.map(v => {
              const gagnante = meilleure?.cle === v.cle
              return (
                <div key={v.cle}
                     className={`rounded-xl border p-4 ${gagnante
                       ? 'border-emerald-500/50 bg-emerald-500/[0.07]'
                       : 'border-neutral-800 bg-neutral-950/40'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white text-[15px]">{v.nom}</p>
                    {gagnante && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-black text-emerald-300">
                        <Trophy size={11} /> En tête
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-neutral-500 mt-0.5">?ab_prix={v.cle}</p>

                  <p className="mt-3 font-display font-black text-3xl text-white tabular-nums">{pourcent(v.taux)}</p>
                  <p className="text-[12px] text-neutral-500">de visiteurs inscrits</p>

                  <div className="mt-3 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div className={`h-full rounded-full ${gagnante ? 'bg-emerald-400' : 'bg-neutral-600'}`}
                         style={{ width: `${Math.min(100, ((v.taux || 0) / tauxMax) * 100)}%` }} />
                  </div>

                  <dl className="mt-3 grid grid-cols-3 gap-2 text-[13px]">
                    <div className="rounded-lg bg-neutral-900/70 px-2.5 py-2">
                      <dt className="flex items-center gap-1 text-[11px] text-neutral-500"><Eye size={11} /> Visiteurs</dt>
                      <dd className="font-bold text-white tabular-nums">{v.vues}</dd>
                    </div>
                    <div className="rounded-lg bg-neutral-900/70 px-2.5 py-2">
                      <dt className="flex items-center gap-1 text-[11px] text-neutral-500"><UserCheck size={11} /> Inscrits</dt>
                      <dd className="font-bold text-white tabular-nums">{v.inscriptions}</dd>
                    </div>
                    <div className="rounded-lg bg-neutral-900/70 px-2.5 py-2">
                      <dt className="flex items-center gap-1 text-[11px] text-neutral-500"><BadgeCheck size={11} /> Payants</dt>
                      <dd className="font-bold text-white tabular-nums">{v.payants}</dd>
                    </div>
                  </dl>

                  {/* Le taux qui décide vraiment : s'inscrire ne coûte rien,
                      payer l'acompte si. */}
                  <p className="mt-2 text-[12px] text-neutral-400">
                    Acompte payé : <b className="text-white">{pourcent(v.tauxPaiement)}</b>
                    <span className="text-neutral-500"> des inscrits</span>
                  </p>
                </div>
              )
            })}
          </div>

          {/* Le verdict, ou l'absence de verdict : annoncer une gagnante sur
              trente visiteurs ferait prendre une décision sur du bruit. */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3.5 text-sm">
            {meilleure ? (
              <p className="text-neutral-300">
                <b className="text-white">{meilleure.nom}</b> transforme mieux,
                de <b className="text-emerald-400">{pourcent(ecart)}</b> en valeur absolue.
                Les deux versions ont dépassé {VISITES_MINIMUM} visiteurs et {INSCRIPTIONS_MINIMUM} inscriptions.
              </p>
            ) : (
              <p className="text-neutral-400">
                Pas encore assez de monde pour conclure. Il faut au moins {VISITES_MINIMUM} visiteurs
                et {INSCRIPTIONS_MINIMUM} inscriptions <i>de chaque côté</i> ; en dessous, l'écart vient
                surtout du hasard.
              </p>
            )}
          </div>

          {donnees.jours?.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500 mb-2">Jour par jour</p>
              <div className="overflow-x-auto rounded-xl border border-neutral-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-neutral-500">
                      <th className="text-left font-bold px-3 py-2">Jour</th>
                      <th className="text-right font-bold px-3 py-2">Prix affiché</th>
                      <th className="text-right font-bold px-3 py-2">Prix caché</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donnees.jours.map(j => (
                      <tr key={j.jour} className="border-t border-neutral-800">
                        <td className="px-3 py-2 font-mono text-[12px] text-neutral-400">{j.jour}</td>
                        {['avec', 'sans'].map(cle => (
                          <td key={cle} className="px-3 py-2 text-right tabular-nums text-neutral-200">
                            <b className="text-white">{j[cle].inscriptions}</b>
                            <span className="text-neutral-500"> / {j[cle].vues}</span>
                            {j[cle].payants > 0 && (
                              <span className="text-emerald-400"> · {j[cle].payants} payé{j[cle].payants > 1 ? 's' : ''}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1.5">Inscriptions / visiteurs, puis acomptes reçus.</p>
            </div>
          )}

          {donnees.sansVariante > 0 && (
            <p className="text-[12px] text-neutral-500">
              {donnees.sansVariante} inscription{donnees.sansVariante > 1 ? 's' : ''} hors test
              {' '}(avant sa mise en place) — non comptée{donnees.sansVariante > 1 ? 's' : ''} ci-dessus.
            </p>
          )}
        </>
      )}
    </div>
  )
}
