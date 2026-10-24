import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import { Trophy, CheckCircle2, Loader2 } from 'lucide-react'

// Page participant MYLTA LIVE — pas de compte. On rejoint avec un nom et un
// e-mail, on reçoit un jeton propre à cette session (scope "live", voir
// backend/routes/live.js) et on répond aux questions diffusées en direct.
//
// Volontairement séparée de l'instance axios partagée (api/axios.js) : son
// intercepteur redirige vers l'accueil au premier 401, ce qui casserait la
// page si un jeton participant expire pendant la conférence.

function apiOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) return window.location.origin
  try { return new URL(apiUrl, window.location.origin).origin } catch { return window.location.origin }
}

const live = axios.create({ baseURL: `${apiOrigin()}/api/live`, timeout: 15000, withCredentials: true })
const CSRF_COOKIE_NAME = import.meta.env.PROD ? '__Host-csrf' : '_csrf'

// Même pattern CSRF que api/axios.js, en local pour ne pas dépendre de lui.
live.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]+)`))
    if (match) config.headers['x-csrf-token'] = decodeURIComponent(match[1])
    else {
      await axios.get(`${apiOrigin()}/api/health`, { withCredentials: true }).catch(() => {})
      const m2 = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]+)`))
      if (m2) config.headers['x-csrf-token'] = decodeURIComponent(m2[1])
    }
  }
  return config
})

export default function LiveParticipantPage() {
  const { sessionId } = useParams()
  const [publicInfo, setPublicInfo] = useState(null)
  const [token, setToken] = useState(() => sessionStorage.getItem(`live_token_${sessionId}`))
  const [form, setForm] = useState({ email: '', displayName: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('draft')
  const [question, setQuestion] = useState(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [freeText, setFreeText] = useState('')
  const socketRef = useRef(null)

  useEffect(() => {
    live.get(`/sessions/${sessionId}/public`)
      .then(({ data }) => setPublicInfo(data.session))
      .catch(() => setError('Session introuvable.'))
  }, [sessionId])

  // Une fois le jeton obtenu, on récupère l'état courant puis on écoute le
  // socket pour les nouvelles questions / changements de statut.
  useEffect(() => {
    if (!token) return
    live.get(`/sessions/${sessionId}/state`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setStatus(data.status)
        setQuestion(data.currentQuestion)
        setScore(data.score)
      })
      .catch(() => { sessionStorage.removeItem(`live_token_${sessionId}`); setToken(null) })

    const socket = io(`${apiOrigin()}/live`, { path: '/socket.io', auth: { token } })
    socketRef.current = socket
    socket.on('live:status', ({ status: s }) => setStatus(s))
    socket.on('live:question', ({ question: q }) => { setQuestion(q); setAnswered(false); setFreeText('') })
    return () => socket.disconnect()
  }, [token, sessionId])

  const join = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data } = await live.post(`/sessions/${sessionId}/join`, form)
      sessionStorage.setItem(`live_token_${sessionId}`, data.token)
      setToken(data.token)
      setScore(data.participant.score)
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de rejoindre la session.')
    } finally {
      setBusy(false)
    }
  }

  const vote = async (option) => {
    if (!question || answered) return
    setAnswered(true)
    try {
      await live.post(`/questions/${question.id}/vote`, { option }, { headers: { Authorization: `Bearer ${token}` } })
    } catch { setAnswered(false) }
  }

  const answer = async (e) => {
    e.preventDefault()
    if (!question || !freeText.trim()) return
    try {
      const { data } = await live.post(`/questions/${question.id}/answer`, { answer: freeText }, { headers: { Authorization: `Bearer ${token}` } })
      setAnswered(true)
      if (data.isCorrect) setScore(s => s + 10)
    } catch { /* silencieux : le participant peut réessayer */ }
  }

  if (error && !publicInfo) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-center"><p className="text-academy-textMain/60">{error}</p></div>
  }
  if (!publicInfo) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-academy-primary" /></div>
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-academy-surface">
        <form onSubmit={join} className="w-full max-w-sm rounded-2xl border border-academy-border bg-white p-6 space-y-4">
          <h1 className="font-display font-black text-xl text-center">{publicInfo.title}</h1>
          {publicInfo.description && <p className="text-[13px] text-center text-academy-textMain/60">{publicInfo.description}</p>}
          {error && <p className="text-[13px] text-red-600 text-center">{error}</p>}
          <input required placeholder="Votre prénom" className="w-full rounded-xl border border-academy-border px-3 py-2.5 text-[14px]"
                 value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} />
          <input required type="email" placeholder="Votre e-mail" className="w-full rounded-xl border border-academy-border px-3 py-2.5 text-[14px]"
                 value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-academy-primary text-white py-3 font-black disabled:opacity-50">
            {busy ? 'Connexion…' : 'Rejoindre'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academy-surface p-5">
      <div className="max-w-md mx-auto">
        <p className="flex items-center justify-between text-[13px] font-bold text-academy-textMain/60 mb-4">
          <span>{publicInfo.title}</span>
          <span className="inline-flex items-center gap-1"><Trophy size={14} /> {score} pts</span>
        </p>

        {status !== 'live' && (
          <p className="text-center text-academy-textMain/60 mt-10">
            {status === 'draft' ? 'En attente du démarrage par l\'organisateur…' : 'Cette session est terminée. Merci d\'avoir participé !'}
          </p>
        )}

        {status === 'live' && !question && (
          <p className="text-center text-academy-textMain/60 mt-10">En attente de la prochaine question…</p>
        )}

        {status === 'live' && question && (
          <div className="rounded-2xl border border-academy-border bg-white p-5">
            <p className="font-bold text-[16px] mb-4">{question.text}</p>

            {question.type !== 'freeform' ? (
              <div className="space-y-2">
                {question.options.map(opt => (
                  <button key={opt} disabled={answered} onClick={() => vote(opt)}
                          className="w-full text-left rounded-xl border border-academy-border px-4 py-3 text-[14px] font-semibold disabled:opacity-50 hover:border-academy-primary transition-colors">
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={answer} className="space-y-2">
                <input disabled={answered} className="w-full rounded-xl border border-academy-border px-3 py-2.5 text-[14px]"
                       value={freeText} onChange={e => setFreeText(e.target.value)} placeholder="Votre réponse" />
                <button type="submit" disabled={answered} className="w-full rounded-xl bg-academy-primary text-white py-2.5 font-bold disabled:opacity-50">Envoyer</button>
              </form>
            )}

            {answered && <p className="mt-3 flex items-center gap-1.5 text-[13px] font-bold text-green-700"><CheckCircle2 size={15} /> Réponse envoyée</p>}
          </div>
        )}
      </div>
    </div>
  )
}
