// LoginModal.jsx — Formulaire de connexion / inscription (Sécurisé)

import { useState, useEffect, useRef } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../hooks/useToast.jsx'
import HumanVerification from './HumanVerification'
import { facebookLogin } from '../utils/facebookAuth'

// Champ de saisie : même gabarit pour tous les champs du formulaire.
// L'icône est posée en `start` (et non `left`) pour suivre l'arabe en RTL.
const FIELD_CLASS =
  'w-full h-[52px] rounded-2xl bg-academy-surface dark:bg-white/[0.04] ' +
  'border border-academy-border text-academy-textMain text-[15px] ' +
  'ps-11 pe-4 placeholder:text-academy-textMain/35 ' +
  'focus:outline-none focus:border-academy-primary/60 focus:ring-4 focus:ring-academy-primary/10 ' +
  'transition-all duration-200'

export default function LoginModal({ onClose, onSuccess }) {
  const { t, currentLang } = useLanguage()
  const { login, loginWithGoogle, loginWithFacebook, register, checkAuth } = useAuth()
  const { success, error: toastError } = useToast()
  const [mode, setMode]         = useState('login') // 'login' | 'register' | 'forgot-password'
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [form, setForm]         = useState({ email: '', password: '', name: '' })

  // Human verification state
  const [isHumanVerified, setIsHumanVerified] = useState(false)
  // Compte existant mais email jamais activé → on propose de renvoyer le lien
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resending, setResending] = useState(false)

  // Le bouton Google est rendu par Google dans une iframe : sa largeur ne peut
  // être qu'un nombre de pixels (200–400). On mesure donc le conteneur pour
  // qu'il s'aligne exactement sur le bouton Facebook, à toutes les tailles.
  const googleWrapRef = useRef(null)
  const [googleWidth, setGoogleWidth] = useState(320)

  useEffect(() => {
    const el = googleWrapRef.current
    if (!el) return
    const measure = () =>
      setGoogleWidth(Math.min(400, Math.max(200, Math.round(el.offsetWidth))))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mode])

  const set = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }))
  }

  // Vérification de la force du mot de passe (simplifiée)
  const calculateStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 8) score += 50
    if (/[a-zA-Z]/.test(pwd) && /\d/.test(pwd)) score += 50
    return score
  }

  const passwordStrength = calculateStrength(form.password)

  // Reset captcha when switching modes
  useEffect(() => {
    setIsHumanVerified(false)
    setNeedsVerification(false)
  }, [mode])

  const handleResendVerification = async () => {
    setResending(true)
    try {
      const res = await api.post('/auth/resend-verification', { email: form.email })
      success(res.data?.message || 'Lien d\'activation renvoyé.')
      if (res.data?.autoVerified) setNeedsVerification(false)
    } catch (err) {
      toastError(err.response?.data?.error || 'Impossible de renvoyer le lien pour le moment.')
    } finally {
      setResending(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    try {
      await loginWithGoogle(credentialResponse.credential)
      await checkAuth()
      success(t('login.welcome_back'))
      onSuccess?.()
      onClose?.()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur Google Auth')
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setLoading(true)
    try {
      const accessToken = await facebookLogin()
      await loginWithFacebook(accessToken)
      await checkAuth()
      success(t('login.welcome_back'))
      onSuccess?.()
      onClose?.()
    } catch (err) {
      toastError(err.response?.data?.error || 'Échec de la connexion Facebook')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'forgot-password') {
        const res = await api.post('/auth/forgot-password', { email: form.email })
        success(res.data?.message || 'Email de réinitialisation envoyé.')
        setMode('login')
        return
      }

      setNeedsVerification(false)

      if (mode === 'register') {
        if (passwordStrength < 100) {
          toastError(t('login.password_hint'))
          setLoading(false)
          return
        }
        if (!isHumanVerified) {
          toastError("Veuillez compléter la vérification humaine.")
          setLoading(false)
          return
        }

        const res = await register(form.email, form.password, form.name, 'human-verification-passed')
        if (res.autoVerified) {
          // Compte déjà actif (pas de vérification par email) : connexion directe.
          await login(form.email, form.password)
          await checkAuth()
          success(t('login.welcome_back'))
          onSuccess?.()
          onClose?.()
          return
        }
        success(res.message || t('login.verification_wait'))
        // Ne pas fermer immédiatement, l'utilisateur doit vérifier son email
        setMode('login') // Switch to login mode but they still need to verify
      } else {
        await login(form.email, form.password)
        await checkAuth() // Met à jour le contexte avec le cookie
        success(t('login.welcome_back'))
        onSuccess?.()
        onClose?.()
      }
    } catch (err) {
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') setNeedsVerification(true)
      toastError(err.response?.data?.error || t('login.generic_error'))
    } finally {
      setLoading(false)
    }
  }

  const isForgot = mode === 'forgot-password'

  const title = isForgot
    ? 'Mot de passe oublié'
    : mode === 'login' ? t('login.welcome') : t('login.join_us')

  const subtitle = isForgot
    ? 'Récupérez l\'accès à votre compte'
    : mode === 'login'
      ? 'Reprenez vos formations là où vous les avez laissées'
      : 'Créez votre compte en moins d\'une minute'

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-fade-in" />

      <div className="relative w-full max-w-[420px] animate-fade-up"
           onClick={e => e.stopPropagation()}>

        {/* Halo de marque : remplace l'ancien bandeau gris du header */}
        <div aria-hidden
             className="pointer-events-none absolute -inset-8 bg-[radial-gradient(closest-side,rgb(var(--academy-primary)/0.18),transparent)] blur-2xl" />

        <div className="relative bg-academy-white border border-academy-border rounded-[28px]
                        shadow-[0_40px_90px_-25px_rgba(0,0,0,0.55)]
                        overflow-hidden max-h-[90vh] overflow-y-auto hide-scrollbar">

          {/* Liseré lumineux en haut de la carte */}
          <div aria-hidden
               className="pointer-events-none absolute inset-x-0 top-0 h-px
                          bg-gradient-to-r from-transparent via-academy-primary/50 to-transparent" />
          <div aria-hidden
               className="pointer-events-none absolute inset-x-0 top-0 h-40
                          bg-[radial-gradient(closest-side,rgb(var(--academy-primary)/0.10),transparent)]" />

          <button onClick={onClose}
                  aria-label="Fermer"
                  className="absolute top-4 end-4 z-10 w-9 h-9 grid place-items-center rounded-full
                             text-academy-textMain/40 hover:text-academy-textMain
                             hover:bg-academy-textMain/5 transition-colors">
            <X size={18} />
          </button>

          {/* ── En-tête ── */}
          <div className="relative px-6 pt-9 pb-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl p-2 bg-academy-surface dark:bg-white/[0.04]
                            border border-academy-border shadow-soft
                            ring-4 ring-academy-primary/5 overflow-hidden">
              <img
                src="/logo-128.png"
                alt="Logo Mylta Academy"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo-256.png';
                }}
              />
            </div>

            <h2 className="mt-4 font-display font-black text-academy-textMain text-[26px] leading-tight tracking-tight">
              {title}
            </h2>
            <p className="mt-1.5 text-academy-textMain/50 text-[13px] font-medium max-w-[280px] mx-auto">
              {subtitle}
            </p>
          </div>

          {/* ── Sélecteur Connexion / Inscription ── */}
          {!isForgot && (
            <div className="px-6">
              <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-academy-surface dark:bg-white/[0.04]
                              border border-academy-border">
                {[
                  { key: 'login',    label: t('login.sign_in') },
                  { key: 'register', label: t('login.register') },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMode(tab.key)}
                    aria-pressed={mode === tab.key}
                    className={`h-10 rounded-full text-sm font-bold transition-all duration-200 ${
                      mode === tab.key
                        ? 'bg-academy-primary text-academy-onPrimary shadow-soft'
                        : 'text-academy-textMain/50 hover:text-academy-textMain'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Connexion sociale ── */}
          {!isForgot && (
            <div className="px-6 pt-5">
              {/* Google et Facebook sont inaccessibles depuis ici : les boutons
                  menaient à un échec de connexion. On annonce leur retour plutôt
                  que de laisser le visiteur buter dessus. */}
              <div className="rounded-xl border border-academy-border bg-academy-surface dark:bg-white/[0.04] px-4 py-3 text-center">
                <p className="text-[13px] font-bold text-academy-textMain/75">Connexion Google et Facebook</p>
                <p className="mt-0.5 text-[12px] text-academy-textMain/55">Bientôt disponible. En attendant, utilisez votre e-mail ou votre téléphone.</p>
              </div>

              <div className="my-5 h-px bg-academy-border" />
            </div>
          )}

          <form onSubmit={handleSubmit} className={`px-6 pb-7 space-y-3 ${isForgot ? 'pt-1' : ''}`}>
            {mode === 'register' && (
              <div className="relative">
                <User size={17} className="absolute start-4 top-1/2 -translate-y-1/2 text-academy-textMain/35" />
                <input
                  type="text" placeholder={t('login.full_name')} value={form.name}
                  onChange={set('name')} required
                  className={FIELD_CLASS}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={17} className="absolute start-4 top-1/2 -translate-y-1/2 text-academy-textMain/35" />
              <input
                type={mode === 'login' ? 'text' : 'email'} autoComplete="username"
                placeholder={mode === 'login' ? t('login.email_or_phone') : t('login.email')} value={form.email}
                onChange={set('email')} required
                className={FIELD_CLASS}
              />
            </div>

            {!isForgot && (
              <div className="relative">
                <Lock size={17} className="absolute start-4 top-1/2 -translate-y-1/2 text-academy-textMain/35" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder={t('login.password')}
                  value={form.password} onChange={set('password')} required minLength={6}
                  className={`${FIELD_CLASS} pe-12`}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                        aria-label={showPwd ? t('login.hide_password') : t('login.show_password')}
                        className="absolute end-3 top-1/2 -translate-y-1/2 p-2 rounded-lg
                                   text-academy-textMain/35 hover:text-academy-textMain
                                   hover:bg-academy-textMain/5 transition-all">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-xs font-bold text-academy-textMain/45 hover:text-academy-primary transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {mode === 'register' && form.password.length > 0 && (
              <div className="space-y-2.5 rounded-2xl bg-academy-surface dark:bg-white/[0.04]
                              border border-academy-border p-3.5">
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-academy-textMain/45">{t('login.password_strength')}</span>
                  <span className={passwordStrength < 50 ? 'text-red-500' : passwordStrength < 100 ? 'text-amber-500' : 'text-emerald-500'}>
                    {passwordStrength < 50 ? 'Faible' : passwordStrength < 100 ? 'Moyen' : 'Solide'}
                  </span>
                </div>

                {/* Deux segments = les deux critères vérifiés ci-dessous */}
                <div className="flex gap-1.5">
                  {[50, 100].map(step => (
                    <span key={step}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            passwordStrength >= step
                              ? (passwordStrength < 100 ? 'bg-amber-500' : 'bg-emerald-500')
                              : 'bg-academy-textMain/10'
                          }`} />
                  ))}
                </div>

                <div className="space-y-1.5 pt-0.5">
                  {[
                    { label: currentLang === 'ar' ? '8 أحرف كحد أدنى' : currentLang === 'en' ? 'At least 8 characters' : '8 caractères minimum', met: form.password.length >= 8 },
                    { label: currentLang === 'ar' ? 'حرف واحد ورقم واحد على الأقل' : currentLang === 'en' ? 'At least 1 letter and 1 number' : 'Au moins 1 lettre et 1 chiffre', met: /[a-zA-Z]/.test(form.password) && /\d/.test(form.password) }
                  ].map((crit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11.5px]">
                      <span className={`w-4 h-4 shrink-0 grid place-items-center rounded-full ${
                        crit.met ? 'bg-emerald-500/15 text-emerald-500' : 'bg-academy-textMain/[0.07] text-academy-textMain/30'
                      }`}>
                        {crit.met ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
                      </span>
                      <span className={crit.met ? 'text-academy-textMain/70 font-medium' : 'text-academy-textMain/35'}>
                        {crit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vérification Humaine Premium (inscription uniquement) */}
            {mode === 'register' && (
              <div className="pt-0.5">
                <HumanVerification
                  variant="light"
                  onVerified={(verified) => setIsHumanVerified(verified)}
                />
              </div>
            )}

            {needsVerification && mode === 'login' && (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 p-3.5 text-sm">
                <p className="text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  Votre compte n'est pas encore activé. Vérifiez votre boîte de réception (et les spams).
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="mt-2 font-bold text-amber-900 dark:text-amber-200 underline underline-offset-2 disabled:opacity-50"
                >
                  {resending ? 'Envoi en cours…' : 'Renvoyer le lien d\'activation'}
                </button>
              </div>
            )}

            <button
              type="submit" disabled={loading || (mode === 'register' && (passwordStrength < 100 || !isHumanVerified))}
              className="group w-full h-[52px] mt-1 inline-flex items-center justify-center gap-2 rounded-full
                         bg-academy-primary text-academy-onPrimary text-[15px] font-bold
                         shadow-[0_10px_30px_-10px_rgb(var(--academy-primary)/0.6)]
                         hover:brightness-110 active:scale-[0.98] transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  {t('login.loading')}
                </>
              ) : (
                <>
                  {isForgot ? 'Envoyer le lien' : mode === 'login' ? t('login.sign_in') : t('login.create_account')}
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                </>
              )}
            </button>

            {isForgot ? (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full inline-flex items-center justify-center gap-1.5 pt-1
                           text-sm font-bold text-academy-textMain/50 hover:text-academy-textMain transition-colors"
              >
                <ArrowLeft size={15} className="rtl:rotate-180" />
                Retour à la connexion
              </button>
            ) : (
              <p className="flex items-center justify-center gap-1.5 pt-1 text-[11.5px] font-medium text-academy-textMain/35">
                <ShieldCheck size={13} className="text-emerald-500" />
                {t('login.secure_access')} — connexion chiffrée
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
