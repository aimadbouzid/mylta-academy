import { useMemo, useRef, useState } from 'react'
import { Sparkles, ArrowUp, RotateCcw, MessageCircle } from 'lucide-react'

// Assistant des questions fréquentes. Plutôt que d'aligner vingt-sept
// questions que personne ne lit, on pose la sienne : l'assistant cherche dans
// les réponses du site et affiche celle qui correspond.
//
// Il ne compose pas de texte : il retrouve la bonne réponse parmi celles
// écrites par l'académie. C'est volontaire — une réponse inventée sur un prix
// ou une date ferait plus de mal que de bien.

// Ce qu'on nous demande en premier : ces questions passent devant les autres.
const PRIORITE = ['coûte', 'reçois', 'apprend', 'débutant', 'dates', 'où se passe',
                  'certificat', 'paie', 'réserve', 'ordinateur', 'combien dans le groupe']

const VIDES = new Set(['pour', 'avec', 'dans', 'une', 'des', 'les', 'que', 'qui', 'est',
                       'ce', 'je', 'la', 'le', 'de', 'du', 'et', 'en', 'au', 'sur', 'par',
                       'vous', 'nous', 'quoi', 'comment', 'quel', 'quelle', 'faut', 'il',
                       'elle', 'mon', 'ma', 'mes', 'votre', 'vos', 'tout', 'tous', 'plus'])

// Les visiteurs n'emploient pas les mots de la FAQ : on cherche « prix », la
// réponse dit « coûte ». Chaque groupe réunit les façons de dire la même
// chose ; un mot trouvé dans un groupe élargit la recherche à tout le groupe.
const GROUPES = [
  ['prix', 'tarif', 'cout', 'coute', 'couter', 'combien', 'argent', 'cher', 'montant', 'dinars'],
  ['paie', 'paiement', 'payer', 'acompte', 'tranche', 'tranches', 'versement', 'edahabia', 'ccp', 'baridimob', 'cib'],
  ['lieu', 'adresse', 'endroit', 'salle', 'bejaia', 'passe'],
  ['date', 'dates', 'quand', 'session', 'sessions', 'calendrier', 'novembre'],
  ['debutant', 'debutante', 'niveau', 'zero', 'experience', 'prerequis', 'commencer'],
  ['certificat', 'diplome', 'attestation'],
  ['ordinateur', 'portable', 'smartphone', 'telephone', 'materiel', 'camera'],
  ['apprend', 'apprendre', 'programme', 'contenu', 'modules', 'cours', 'montage', 'filmer'],
  ['annuler', 'annulation', 'rembourser', 'remboursement', 'reporter', 'changer', 'absent', 'venir'],
  ['groupe', 'places', 'participants', 'monde'],
  ['langue', 'darija', 'francais', 'arabe'],
  ['reserve', 'reserver', 'reservation', 'inscrire', 'inscription', 'place'],
  ['suivi', 'apres', 'bloque', 'aide', 'support', 'whatsapp', 'contacter'],
]

const nettoyer = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const mots = (s) => nettoyer(s).split(/[^a-z0-9]+/).filter(m => m.length > 2 && !VIDES.has(m))

export default function AssistantFaq({ items = [], whatsappNumber }) {
  const [question, setQuestion] = useState('')
  const [fil, setFil] = useState([])
  const champ = useRef(null)
  if (!items.length) return null

  // Les questions les plus demandées d'abord, le reste derrière dans l'ordre du site.
  const parPriorite = useMemo(() => {
    const rang = (q) => {
      const i = PRIORITE.findIndex(p => nettoyer(q).includes(nettoyer(p)))
      return i === -1 ? 999 : i
    }
    return [...items].sort((a, b) => rang(a.question) - rang(b.question))
  }, [items])

  // Un mot qui tombe dans la question compte plus que le même mot noyé
  // dans la réponse : c'est la question qui dit de quoi on parle.
  const propositions = useMemo(() => {
    const cherches = [...new Set(mots(question).flatMap(m => {
      const groupe = GROUPES.find(g => g.some(x => x.startsWith(m) || m.startsWith(x)))
      return groupe ? [m, ...groupe] : [m]
    }))]
    if (!cherches.length) return parPriorite.slice(0, 6)
    const notes = items.map(it => {
      const dansQ = mots(it.question)
      const dansR = mots(it.answer)
      let note = 0
      cherches.forEach(m => {
        if (dansQ.some(x => x.startsWith(m) || m.startsWith(x))) note += 3
        else if (dansR.some(x => x.startsWith(m) || m.startsWith(x))) note += 1
      })
      return { it, note }
    }).filter(x => x.note > 0).sort((a, b) => b.note - a.note)
    return notes.slice(0, 5).map(x => x.it)
  }, [question, items, parPriorite])

  const repondre = (item) => {
    // Reposer la question qu'on vient de poser n'ajoute pas la même réponse deux fois.
    setFil(f => (f[f.length - 1]?.question === item.question ? f : [...f, item]))
    setQuestion('')
    champ.current?.focus()
  }

  const envoyer = (e) => {
    e.preventDefault()
    if (propositions.length) repondre(propositions[0])
  }

  const wa = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        question ? `Bonjour Mylta Academy, ${question}` : 'Bonjour Mylta Academy, j\'ai une question sur la formation.')}`
    : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-academy-border bg-academy-white overflow-hidden">

        <div className="flex items-center gap-2 px-4 py-3 border-b border-academy-border">
          <Sparkles size={15} className="text-academy-primary shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-academy-textMain/60">
            Assistant Mylta · réponse immédiate
          </span>
          {fil.length > 0 && (
            <button type="button" onClick={() => setFil([])}
                    className="ms-auto inline-flex items-center gap-1 text-[12px] font-bold text-academy-textMain/50 hover:text-academy-textMain">
              <RotateCcw size={12} /> Effacer
            </button>
          )}
        </div>

        {/* Les réponses déjà obtenues restent à l'écran, comme une conversation. */}
        {fil.length > 0 && (
          <div className="px-4 py-4 space-y-4 max-h-[22rem] overflow-y-auto">
            {fil.map((it, i) => (
              <div key={i}>
                <p className="inline-block rounded-xl rounded-br-sm bg-academy-textMain text-academy-surface px-3 py-2 text-[13.5px] font-semibold float-right clear-both max-w-[85%]">
                  {it.question}
                </p>
                <p className="clear-both pt-3 border-s-2 border-academy-primary ps-3 text-[14px] leading-relaxed text-academy-textMain/80">
                  {it.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={envoyer} className="flex items-center gap-2 px-3 py-2.5 border-y border-academy-border">
          <input ref={champ} value={question} onChange={e => setQuestion(e.target.value)}
                 placeholder="Posez votre question…" aria-label="Posez votre question"
                 className="flex-1 min-w-0 bg-transparent text-[15px] py-1.5 outline-none placeholder:text-academy-textMain/40" />
          <button type="submit" disabled={!propositions.length} aria-label="Envoyer"
                  className="shrink-0 w-9 h-9 rounded-full bg-academy-primary text-academy-onPrimary flex items-center justify-center disabled:opacity-30">
            <ArrowUp size={16} />
          </button>
        </form>

        <div className="px-3 py-3">
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-academy-textMain/45">
            {question ? 'Ces réponses correspondent' : 'Les questions les plus posées'}
          </p>
          {propositions.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {propositions.map((it, i) => (
                <button key={i} type="button" onClick={() => repondre(it)}
                        className="text-start text-[13px] font-semibold rounded-full border border-academy-border px-3 py-1.5
                                   hover:border-academy-primary hover:text-academy-primary transition-colors">
                  {it.question}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-2 px-1">
              <p className="text-[13.5px] text-academy-textMain/65">
                Je n'ai pas cette réponse ici. Posez-la-nous directement, on répond 7 jours sur 7.
              </p>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer"
                   className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-academy-primary border-b-2 border-academy-primary">
                  <MessageCircle size={14} /> Écrire sur WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
