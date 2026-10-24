import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import { Maximize2, Trophy } from 'lucide-react'

// Grand écran (vidéoprojecteur) — lecture seule, jeton "live-display" séparé
// de la session admin pour ne jamais être déconnecté par l'anti-partage
// (voir backend/socket.js). Affiche la question en cours, les votes en
// temps réel et le classement.

function apiOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) return window.location.origin
  try { return new URL(apiUrl, window.location.origin).origin } catch { return window.location.origin }
}

export default function LiveDisplayPage() {
  const { sessionId } = useParams()
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState('draft')
  const [question, setQuestion] = useState(null)
  const [tally, setTally] = useState({})
  const [leaderboard, setLeaderboard] = useState([])
  const rootRef = useRef(null)

  useEffect(() => {
    if (!token) return
    const socket = io(`${apiOrigin()}/live`, { path: '/socket.io', auth: { token } })
    socket.on('live:status', ({ status: s }) => setStatus(s))
    socket.on('live:question', ({ question: q }) => { setQuestion(q); setTally({}) })
    socket.on('live:vote_update', ({ questionId, tally: t }) => setQuestion(q => (q?.id === questionId ? (setTally(t), q) : q)))
    return () => socket.disconnect()
  }, [token, sessionId])

  // Classement rafraîchi périodiquement : pas besoin de temps réel strict,
  // un décalage de quelques secondes ne gêne pas un affichage public.
  useEffect(() => {
    const load = () => axios.get(`${apiOrigin()}/api/live/sessions/${sessionId}/leaderboard`)
      .then(({ data }) => setLeaderboard(data.leaderboard || [])).catch(() => {})
    load()
    const id = setInterval(load, 8000)
    return () => clearInterval(id)
  }, [sessionId])

  const goFullscreen = () => rootRef.current?.requestFullscreen?.().catch(() => {})

  if (!token) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center"><p>Lien incomplet : jeton d'affichage manquant.</p></div>
  }

  return (
    <div ref={rootRef} className="min-h-screen bg-[#0a0a12] text-white p-10 flex flex-col">
      <button onClick={goFullscreen} className="absolute top-4 right-4 opacity-40 hover:opacity-100">
        <Maximize2 size={20} />
      </button>

      {status !== 'live' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-3xl font-black opacity-60">
            {status === 'draft' ? 'En attente du démarrage…' : 'Session terminée — merci !'}
          </p>
        </div>
      )}

      {status === 'live' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col justify-center">
            {question ? (
              <>
                <p className="text-4xl font-black mb-8">{question.text}</p>
                {question.options?.length > 0 && (
                  <div className="space-y-3">
                    {question.options.map(opt => {
                      const total = Object.values(tally).reduce((a, b) => a + b, 0) || 1
                      const count = tally[opt] || 0
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={opt} className="relative rounded-xl bg-white/10 overflow-hidden h-14">
                          <div className="absolute inset-y-0 left-0 bg-academy-primary/70 transition-all duration-500" style={{ width: `${pct}%` }} />
                          <div className="relative h-full flex items-center justify-between px-5 text-xl font-bold">
                            <span>{opt}</span><span>{count} ({pct}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="text-2xl opacity-60">En attente de la prochaine question…</p>
            )}
          </div>

          <div>
            <p className="flex items-center gap-2 text-xl font-black mb-4 opacity-80"><Trophy size={22} /> Classement</p>
            <ol className="space-y-2">
              {leaderboard.map((p, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5">
                  <span className="font-bold">#{i + 1} {p.displayName}</span>
                  <span className="font-black text-academy-primary">{p.score}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
