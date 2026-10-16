import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Copy, Check, MessageCircle, LogIn } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'

// Page ouverte en scannant le QR code du formateur : crée l'accès plateforme en une étape.
export default function JoinPage() {
  const [params] = useSearchParams()
  const code = params.get('code') || ''
  const [valid, setValid] = useState(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [account, setAccount] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get('/in-person/join/check', { params: { code } })
      .then(({ data }) => setValid(data.valid))
      .catch(() => setValid(false))
  }, [code])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/in-person/join', { code, fullName, phone })
      setAccount(data.account)
    } catch (err) {
      setError(err.response?.data?.error || 'La création du compte a échoué. Réessayez.')
    } finally {
      setBusy(false)
    }
  }

  const text = account && `Mylta Academy — mon accès\nIdentifiant : ${account.login}\nMot de passe : ${account.password}\n${window.location.origin}`
  const copy = () => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }).catch(() => {})

  const input = 'w-full bg-white border border-academy-border rounded-xl px-4 py-3 text-base text-academy-textMain outline-none focus:border-academy-textMain'

  return (
    <main className="min-h-screen bg-academy-surface flex items-center justify-center p-4">
      <SEOHead title="Rejoindre la formation" canonicalPath="/rejoindre" noindex />
      <div className="w-full max-w-sm bg-white border border-academy-border rounded-2xl shadow-sm p-5">
        <img src="/logo-128.png" alt="Mylta Academy" className="h-12 w-12 mx-auto mb-3 rounded-xl" />

        {valid === null && <p className="text-center text-sm text-academy-textMain/60">Vérification du QR code…</p>}

        {valid === false && (
          <div className="text-center space-y-2">
            <h1 className="font-bold text-lg">QR code non valide</h1>
            <p className="text-sm text-academy-textMain/60">Ce QR code a expiré. Demandez le nouveau au formateur.</p>
          </div>
        )}

        {valid && !account && (
          <form onSubmit={submit} className="space-y-3">
            <div className="text-center">
              <h1 className="font-bold text-lg">Bienvenue à la formation !</h1>
              <p className="text-sm text-academy-textMain/60">Votre accès à la plateforme est créé en 10 secondes.</p>
            </div>
            <input className={input} placeholder="Nom et prénom" value={fullName} onChange={e => setFullName(e.target.value)} required minLength={3} autoComplete="name" />
            <input className={input} placeholder="Numéro de téléphone" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} required autoComplete="tel" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={busy} className="w-full py-3 rounded-xl bg-neutral-900 text-white font-bold disabled:opacity-50">
              {busy ? 'Création…' : 'Créer mon accès'}
            </button>
          </form>
        )}

        {account && (
          <div className="space-y-3 text-center">
            <h1 className="font-bold text-lg">Votre compte est prêt 🎉</h1>
            <p className="text-sm text-academy-textMain/60">Gardez ces informations : le mot de passe n'est affiché qu'une fois.</p>
            <div className="rounded-xl bg-academy-surface border border-academy-border p-3 text-left text-sm space-y-1">
              <p><span className="text-academy-textMain/60">Identifiant :</span> <b className="font-mono">{account.login}</b></p>
              <p><span className="text-academy-textMain/60">Mot de passe :</span> <b className="font-mono">{account.password}</b></p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={copy} className="py-2.5 rounded-xl border border-academy-border text-sm font-bold inline-flex items-center justify-center gap-1.5">
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copié' : 'Copier'}
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"
                 className="py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-bold inline-flex items-center justify-center gap-1.5">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
            <Link to="/?login=1" className="w-full py-3 rounded-xl bg-neutral-900 text-white font-bold inline-flex items-center justify-center gap-2">
              <LogIn size={18} /> Se connecter
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
