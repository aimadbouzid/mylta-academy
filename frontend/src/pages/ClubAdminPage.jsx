import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { Camera, CameraOff, Check, Download, ImagePlus, Lock, Plus, RefreshCw, Search, Trash2, UserCheck, Users, X } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'
import ClubEventsPanel from '../components/ClubEventsPanel'
import ClubTrainingsPanel from '../components/ClubTrainingsPanel'

// Espace des organisateurs du club scientifique : un mot de passe partagé,
// et rien d'autre que les inscrits aux trois formations. Volontairement séparé
// du tableau de bord de l'académie, que les organisateurs n'ont pas à voir.
//
// Deux usages, l'un après l'autre : avant la séance on regarde les compteurs,
// à la porte on scanne les QR codes. Le pointage se corrige à la main si la
// caméra fait défaut — personne ne reste dehors à cause d'un téléphone.

const KEY = 'clubOrganizerToken'

const phoneFr = (p) => String(p).replace(/(\d{2})(?=\d)/g, '$1 ').trim()
const when = (iso) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const strip = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function ClubAdminPage() {
  const [token, setToken] = useState(() => { try { return localStorage.getItem(KEY) || '' } catch { return '' } })
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [result, setResult] = useState(null)
  const [groups, setGroups] = useState([])
  const [newName, setNewName] = useState('')
  const [newLogo, setNewLogo] = useState('')
  const [groupBusy, setGroupBusy] = useState(false)
  const [groupError, setGroupError] = useState('')
  const videoRef = useRef(null)
  const lastScan = useRef({ code: '', at: 0 })

  const auth = { headers: { Authorization: `Bearer ${token}` } }

  const load = async (t = token) => {
    setError('')
    try {
      const { data } = await api.get('/club/registrations', { headers: { Authorization: `Bearer ${t}` } })
      setData(data)
    } catch (err) {
      if (err.response?.status === 401) {
        setToken('')
        try { localStorage.removeItem(KEY) } catch { /* navigation privée */ }
      }
      setError(err.response?.data?.error || 'Chargement impossible.')
    }
  }

  useEffect(() => { if (token) { load(token); loadGroups(token) } }, [token])

  const signIn = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/club/access', login.trim() ? { login: login.trim(), password } : { password })
      try { localStorage.setItem(KEY, data.token) } catch { /* navigation privée */ }
      setToken(data.token)
      setPassword('')
    } catch (err) {
      setError(err.response?.data?.error || 'Connexion impossible.')
    } finally {
      setBusy(false)
    }
  }

  // Compression dans le navigateur, avant l'envoi : un logo part à 320 px en
  // WebP, quelques dizaines de kilo-octets. Rien à installer sur le serveur,
  // et la connexion de l'organisateur n'est pas sollicitée pour rien.
  const compress = (file, maxSide = 320) => new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      // Safari ancien ne connaît pas le WebP en sortie et rend un PNG : le
      // serveur accepte les deux, la ligne suivante n'a rien à vérifier.
      resolve(canvas.toDataURL('image/webp', 0.82))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')) }
    img.src = url
  })

  const loadGroups = async (t = token) => {
    try {
      const { data } = await api.get('/club/groups/all', { headers: { Authorization: `Bearer ${t}` } })
      setGroups(data.groups || [])
    } catch { /* la liste reste telle quelle */ }
  }

  const pickLogo = async (file) => {
    if (!file) return
    setGroupError('')
    try { setNewLogo(await compress(file)) } catch { setGroupError('Image illisible.') }
  }

  const addGroup = async (e) => {
    e.preventDefault()
    setGroupError('')
    setGroupBusy(true)
    try {
      await api.post('/club/groups', { name: newName, logo: newLogo }, auth)
      setNewName('')
      setNewLogo('')
      loadGroups()
    } catch (err) {
      setGroupError(err.response?.data?.error || "Ajout impossible.")
    } finally {
      setGroupBusy(false)
    }
  }

  const patchGroup = async (id, body) => {
    setGroupError('')
    try {
      await api.patch(`/club/groups/${id}`, body, auth)
      loadGroups()
    } catch (err) {
      setGroupError(err.response?.data?.error || 'Modification impossible.')
    }
  }

  const removeGroup = async (g) => {
    if (!window.confirm(`Retirer « ${g.name} » de la liste ? Les inscrits gardent leur club.`)) return
    setGroupError('')
    try {
      await api.delete(`/club/groups/${g.id}`, auth)
      loadGroups()
    } catch (err) {
      setGroupError(err.response?.data?.error || 'Suppression impossible.')
    }
  }

  const replaceLogo = async (g, file) => {
    if (!file) return
    try { await patchGroup(g.id, { logo: await compress(file) }) } catch { setGroupError('Image illisible.') }
  }

  // Export de la liste : un club tient souvent sa feuille de présence à part,
  // et veut pouvoir l'ouvrir dans Excel ou l'imprimer avant la séance.
  const exportCsv = () => {
    const lignes = [
      ['Prénom', 'Nom', 'Téléphone', 'Formation', 'Club', 'Inscrit le', 'Présent'],
      ...(data?.registrations || []).map(r => [
        r.firstName,
        r.lastName,
        r.phone,
        data.counts.find(c => c.slug === r.training)?.title || r.training,
        r.club || '',
        when(r.createdAt),
        r.checkedInAt ? 'oui' : 'non',
      ]),
    ]
    // Point-virgule et BOM : Excel en français ouvre le fichier en colonnes,
    // avec les accents intacts.
    const csv = '﻿' + lignes.map(l => l.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `inscriptions-club-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const signOut = () => {
    try { localStorage.removeItem(KEY) } catch { /* navigation privée */ }
    setScanning(false)
    setToken('')
    setData(null)
  }

  // Pointage — par QR code scanné ou par le bouton de la liste.
  const checkIn = async (body) => {
    try {
      const { data: r } = await api.post('/club/checkin', body, auth)
      const name = `${r.registration.firstName} ${r.registration.lastName}`
      setResult(
        !r.present
          ? { tone: 'off', title: 'Pointage annulé', name, text: `${name} est de nouveau marqué absent.` }
          : r.alreadyIn
            ? { tone: 'warn', title: 'Déjà pointé', name, text: `${name} est déjà entré pour « ${r.registration.trainingTitle} ».` }
            : { tone: 'ok', title: 'Entrée confirmée', name, text: `${name} — ${r.registration.trainingTitle}` },
      )
      load()
    } catch (err) {
      setResult({ tone: 'bad', title: 'Refusé', text: err.response?.data?.error || 'Pointage impossible.' })
    }
  }

  // Caméra + lecture des QR codes, image par image. Le flux s'arrête dès que
  // l'on quitte le mode scan : pas de caméra allumée en arrière-plan.
  useEffect(() => {
    if (!scanning) return
    let stream = null
    let raf = 0
    let stopped = false
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const tick = () => {
      const v = videoRef.current
      if (v && v.readyState === v.HAVE_ENOUGH_DATA && v.videoWidth) {
        canvas.width = v.videoWidth
        canvas.height = v.videoHeight
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'dontInvert' })
        const now = Date.now()
        // Un QR reste devant l'objectif plusieurs secondes : sans ce garde-fou
        // le même billet serait pointé puis dépointé en boucle.
        if (code?.data && (code.data !== lastScan.current.code || now - lastScan.current.at > 4000)) {
          lastScan.current = { code: code.data, at: now }
          checkIn({ token: code.data, present: true })
        }
      }
      if (!stopped) raf = requestAnimationFrame(tick)
    }

    navigator.mediaDevices?.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      .then(s => {
        if (stopped) { s.getTracks().forEach(t => t.stop()); return }
        stream = s
        videoRef.current.srcObject = s
        videoRef.current.setAttribute('playsinline', 'true')
        return videoRef.current.play()
      })
      .then(() => { if (!stopped) raf = requestAnimationFrame(tick) })
      .catch(() => setScanError("Caméra indisponible. Autorisez l'accès à la caméra, ou pointez à la main dans la liste."))

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [scanning])

  if (!token) {
    return (
      <div className="min-h-screen bg-academy-surface flex items-center justify-center p-5">
        <SEOHead title="Espace organisateurs — Club scientifique" noindex />
        <form onSubmit={signIn} className="w-full max-w-sm rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-academy-primary/10 text-academy-primary"><Lock size={22} /></span>
          <h1 className="mt-3 font-display font-black text-xl">Espace organisateurs</h1>
          <p className="mt-1 text-[13px] text-academy-textMain/60">Inscriptions et entrées des formations du club scientifique.</p>
          {/* Identifiant facultatif : laissé vide, c'est le mot de passe
              partagé d'avant les comptes nominatifs qui ouvre l'espace. */}
          <input type="text" value={login} onChange={e => setLogin(e.target.value)} autoFocus
                 placeholder="Identifiant (laissez vide si vous n'en avez pas)" autoComplete="username"
                 className="mt-5 w-full rounded-xl border border-academy-border bg-academy-surface px-4 py-3 text-[16px] outline-none focus:border-academy-primary transition-colors" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                 placeholder="Mot de passe" autoComplete="current-password"
                 className="mt-2.5 w-full rounded-xl border border-academy-border bg-academy-surface px-4 py-3 text-[16px] outline-none focus:border-academy-primary transition-colors" />
          {error && <p className="mt-3 text-[13px] font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={busy}
                  className="mt-4 w-full rounded-xl bg-academy-textMain text-academy-surface py-3 text-[15px] font-bold disabled:opacity-50">
            {busy ? 'Vérification…' : 'Entrer'}
          </button>
        </form>
      </div>
    )
  }

  const rows = (data?.registrations || []).filter(r => {
    if (!search.trim()) return true
    const q = strip(search)
    return strip(`${r.firstName} ${r.lastName}`).includes(q) || r.phone.includes(search.replace(/\D/g, ''))
  })

  const tone = {
    ok: 'border-green-600/40 bg-green-50 text-green-900',
    warn: 'border-amber-500/40 bg-amber-50 text-amber-900',
    off: 'border-academy-border bg-academy-surface text-academy-textMain',
    bad: 'border-red-500/40 bg-red-50 text-red-900',
  }

  return (
    <div className="min-h-screen bg-academy-surface">
      <SEOHead title="Espace organisateurs — Club scientifique" noindex />
      {/* Marge basse généreuse sur téléphone : la bulle WhatsApp flotte
          au-dessus du dernier inscrit et masquait son bouton de pointage. */}
      <main className="section-container pt-6 pb-28 sm:py-10 max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display font-black text-xl sm:text-2xl tracking-tight">Inscriptions</h1>
            <p className="mt-0.5 text-[13px] sm:text-[14px] text-academy-textMain/60">Club scientifique — Université de Béjaïa</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => load()} title="Actualiser"
                    className="rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-2.5"><RefreshCw size={16} /></button>
            <button type="button" onClick={signOut}
                    className="rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark px-3.5 py-2.5 text-[13px] font-bold">Quitter</button>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[14px] font-semibold text-red-700">{error}</p>}

        {/* Pointage à l'entrée */}
        <section className="mt-5 rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display font-black text-[17px]">Pointage à l'entrée</h2>
              <p className="text-[13px] text-academy-textMain/60">Scannez le QR code de chaque participant.</p>
            </div>
            <button type="button" onClick={() => { setScanning(s => !s); setScanError(''); setResult(null) }}
                    className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-bold ${scanning ? 'bg-academy-textMain text-academy-surface' : 'bg-academy-primary text-white'}`}>
              {scanning ? <><CameraOff size={16} /> Arrêter</> : <><Camera size={16} /> Scanner</>}
            </button>
          </div>

          {scanning && (
            <div className="mt-4 overflow-hidden rounded-xl bg-black">
              <video ref={videoRef} muted playsInline className="w-full max-h-[55vh] object-cover" />
            </div>
          )}
          {scanError && <p className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] font-semibold text-red-700">{scanError}</p>}

          {result && (
            <div className={`mt-3 flex items-start gap-3 rounded-xl border-2 px-4 py-3 ${tone[result.tone]}`}>
              <span className="mt-0.5 shrink-0">{result.tone === 'ok' ? <Check size={20} /> : result.tone === 'bad' ? <X size={20} /> : <UserCheck size={20} />}</span>
              <span className="min-w-0">
                <span className="block font-black text-[15px]">{result.title}</span>
                <span className="block text-[13px] opacity-90">{result.text}</span>
              </span>
            </div>
          )}
        </section>

        <ClubTrainingsPanel auth={auth} />
        <ClubEventsPanel auth={auth} compress={compress} />

        {/* Clubs étudiants : ce sont eux que l'étudiant choisit en s'inscrivant.
            Le logo est réduit dans le navigateur avant d'être envoyé. */}
        <section className="mt-4 rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-4 sm:p-5">
          <h2 className="font-display font-black text-[17px]">Clubs étudiants</h2>
          <p className="text-[13px] text-academy-textMain/60">Ils apparaissent sur la page d'inscription, logo compris.</p>

          {groups.length > 0 && (
            <ul className="mt-3 grid gap-2">
              {groups.map(g => (
                <li key={g.id} className="flex items-center gap-3 rounded-xl border border-academy-border p-2.5">
                  {g.logo
                    ? <img src={g.logo} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                    : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-academy-textMain/[0.06] text-[13px] font-black text-academy-textMain/45">{g.name.slice(0, 2).toUpperCase()}</span>}
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-[15px] leading-tight truncate">{g.name}</span>
                    <span className="block text-[12px] text-academy-textMain/55">{g.active ? 'Visible à l’inscription' : 'Masqué'}</span>
                  </span>
                  <label className="shrink-0 cursor-pointer rounded-lg border border-academy-border p-2" title="Changer le logo">
                    <ImagePlus size={15} />
                    <input type="file" accept="image/*" className="hidden" onChange={e => replaceLogo(g, e.target.files?.[0])} />
                  </label>
                  <button type="button" onClick={() => patchGroup(g.id, { active: !g.active })}
                          className={`shrink-0 rounded-lg px-2.5 py-2 text-[12px] font-bold ${g.active ? 'bg-academy-textMain text-academy-surface' : 'border border-academy-border'}`}>
                    {g.active ? 'Visible' : 'Masqué'}
                  </button>
                  <button type="button" onClick={() => removeGroup(g)} title="Retirer"
                          className="shrink-0 rounded-lg border border-academy-border p-2 text-red-600"><Trash2 size={15} /></button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={addGroup} className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-academy-border px-3 py-2.5 text-[13px] font-bold">
              {newLogo
                ? <img src={newLogo} alt="" className="h-6 w-6 rounded object-cover" />
                : <ImagePlus size={15} />}
              {newLogo ? 'Logo prêt' : 'Logo'}
              <input type="file" accept="image/*" className="hidden" onChange={e => pickLogo(e.target.files?.[0])} />
            </label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom du club" maxLength={60}
                   className="w-full rounded-xl border border-academy-border bg-academy-surface px-4 py-2.5 text-[15px] outline-none focus:border-academy-primary transition-colors" />
            <button type="submit" disabled={groupBusy || newName.trim().length < 2}
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-academy-primary text-white px-4 py-2.5 text-[14px] font-bold disabled:opacity-50">
              <Plus size={15} /> Ajouter
            </button>
          </form>
          {groupError && <p className="mt-2 text-[13px] font-semibold text-red-600">{groupError}</p>}
        </section>

        {!data ? <p className="mt-6 text-sm text-academy-textMain/60">Chargement…</p> : (
          <>
            <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-3">
              {data.counts.map(c => (
                <div key={c.slug} className="rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-4 sm:p-5">
                  <p className="text-[12px] font-black uppercase tracking-[0.12em] text-academy-primary leading-tight">{c.title}</p>
                  <p className="mt-1.5 font-display font-black text-3xl sm:text-4xl tabular-nums">{c.count}</p>
                  <p className="text-[13px] text-academy-textMain/55">{c.count > 1 ? 'inscrits' : 'inscrit'} · {c.present} présent{c.present > 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="flex items-center gap-2 text-[14px] font-bold text-academy-textMain/70">
                <Users size={16} className="text-academy-primary" /> {data.total} inscription{data.total > 1 ? 's' : ''} · {data.present} présent{data.present > 1 ? 's' : ''}
              </p>
              <button type="button" onClick={exportCsv} disabled={!data.total}
                      className="sm:ml-auto inline-flex items-center justify-center gap-2 rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark px-4 py-2.5 text-[13px] font-bold disabled:opacity-50">
                <Download size={15} /> Exporter la liste
              </button>
              <label className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-academy-textMain/40" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher un nom, un numéro"
                       className="w-full rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark pl-9 pr-3 py-2.5 text-[15px] outline-none focus:border-academy-primary transition-colors" />
              </label>
            </div>

            {/* Téléphone : une carte par inscrit, le bouton de pointage au pouce.
                Écran large : un tableau, plus dense à parcourir. */}
            <div className="mt-3 grid gap-2 sm:hidden">
              {rows.length === 0 && <p className="rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark px-4 py-6 text-center text-[14px] text-academy-textMain/55">Aucune inscription.</p>}
              {rows.map(r => (
                <div key={r.id} className="rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-[15px] leading-tight">{r.firstName} {r.lastName}</p>
                      <a href={`tel:${r.phone}`} className="block mt-0.5 text-[14px] tabular-nums text-academy-textMain/70">{phoneFr(r.phone)}</a>
                      <p className="mt-1 text-[13px] text-academy-textMain/55">{data.counts.find(c => c.slug === r.training)?.title || r.training}{r.club ? ` · ${r.club}` : ''}</p>
                    </div>
                    <button type="button" onClick={() => checkIn({ id: r.id })}
                            className={`shrink-0 rounded-xl px-3 py-2 text-[13px] font-bold ${r.checkedInAt ? 'bg-green-600 text-white' : 'border border-academy-border'}`}>
                      {r.checkedInAt ? 'Présent' : 'Pointer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 hidden sm:block overflow-x-auto rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark">
              <table className="w-full text-left text-[14px]">
                <thead className="border-b border-academy-border text-[12px] uppercase tracking-wide text-academy-textMain/50">
                  <tr>
                    <th className="px-4 py-3 font-bold">Nom</th>
                    <th className="px-4 py-3 font-bold">Téléphone</th>
                    <th className="px-4 py-3 font-bold">Formation</th>
                    <th className="px-4 py-3 font-bold">Club</th>
                    <th className="px-4 py-3 font-bold">Inscrit le</th>
                    <th className="px-4 py-3 font-bold text-right">Entrée</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-academy-textMain/55">Aucune inscription.</td></tr>
                  )}
                  {rows.map(r => (
                    <tr key={r.id} className="border-b border-academy-border/60 last:border-0">
                      <td className="px-4 py-3 font-semibold">{r.firstName} {r.lastName}</td>
                      <td className="px-4 py-3 tabular-nums"><a href={`tel:${r.phone}`} className="hover:text-academy-primary">{phoneFr(r.phone)}</a></td>
                      <td className="px-4 py-3">{data.counts.find(c => c.slug === r.training)?.title || r.training}</td>
                      <td className="px-4 py-3 text-academy-textMain/70">{r.club || '—'}</td>
                      <td className="px-4 py-3 text-academy-textMain/60">{when(r.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => checkIn({ id: r.id })}
                                className={`rounded-lg px-3 py-1.5 text-[13px] font-bold ${r.checkedInAt ? 'bg-green-600 text-white' : 'border border-academy-border hover:border-academy-textMain/40'}`}>
                          {r.checkedInAt ? 'Présent' : 'Pointer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
