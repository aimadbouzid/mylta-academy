// LoginModal.jsx — Formulaire de connexion / inscription (Sécurisé)

import { useState, useEffect } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../hooks/useToast.jsx'

export default function LoginModal({ onClose, onSuccess }) {
  const { t, currentLang } = useLanguage()
  const { login, register, checkAuth } = useAuth()
  const { success, error: toastError } = useToast()
  const [mode, setMode]         = useState('login') // 'login' | 'register'
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [form, setForm]         = useState({ email: '', password: '', name: '' })
  
  // Math CAPTCHA
  const [mathCaptcha, setMathCaptcha] = useState({ num1: 0, num2: 0, answer: '', result: 'pending' })

  const set = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }))
  }

  // Vérification de la force du mot de passe
  const calculateStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 12) score += 20
    if (/[A-Z]/.test(pwd)) score += 20
    if (/[a-z]/.test(pwd)) score += 20
    if (/\d/.test(pwd)) score += 20
    if (/[@$!%*?&]/.test(pwd)) score += 20
    return score
  }

  const passwordStrength = calculateStrength(form.password)

  const generateMathCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setMathCaptcha({ num1, num2, answer: '', result: 'pending' })
  }

  useEffect(() => {
    if (mode === 'register') {
      generateMathCaptcha()
    }
  }, [mode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'register') {
        if (passwordStrength < 100) {
          toastError(t('login.password_hint'))
          setLoading(false)
          return
        }
        if (mathCaptcha.result !== 'success') {
          toastError("Veuillez résoudre le calcul pour vérifier que vous êtes humain.")
          setLoading(false)
          return
        }
        
        const res = await register(form.email, form.password, form.name, 'math-captcha-verified')
        success(res.message || t('login.verification_wait')) // Assuming message corresponds to verify email
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
      toastError(err.response?.data?.error || t('login.generic_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md animate-fade-in" />

      <div className="relative w-full max-w-md bg-white border border-academy-border/50
                      rounded-3xl shadow-2xl animate-fade-up overflow-hidden"
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <User size={20} />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-black text-academy-textMain text-xl">
              {mode === 'login' ? t('login.welcome') : t('login.join_us')}
            </h2>
            <p className="text-academy-textMain/50 text-xs font-medium mt-0.5">{t('login.secure_access')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-academy-textMain/30 hover:text-academy-textMain hover:bg-black/5 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-academy-textMain/40" />
              <input
                type="text" placeholder={t('login.full_name')} value={form.name}
                onChange={set('name')} required
                className="w-full bg-gray-50 border border-gray-200 text-academy-textMain text-sm rounded-xl px-4 py-3 pl-10 focus:outline-none focus:bg-white focus:border-academy-primary focus:ring-4 focus:ring-academy-primary/10 transition-all placeholder:text-academy-textMain/30"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-academy-textMain/40" />
            <input
              type="email" placeholder={t('login.email')} value={form.email}
              onChange={set('email')} required
              className="w-full bg-gray-50 border border-gray-200 text-academy-textMain text-sm rounded-xl px-4 py-3 pl-10 focus:outline-none focus:bg-white focus:border-academy-primary focus:ring-4 focus:ring-academy-primary/10 transition-all placeholder:text-academy-textMain/30"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-academy-textMain/40" />
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder={t('login.password')}
              value={form.password} onChange={set('password')} required minLength={mode === 'register' ? 12 : 8}
              className="w-full bg-gray-50 border border-gray-200 text-academy-textMain text-sm rounded-xl px-4 py-3 pl-10 pr-10 focus:outline-none focus:bg-white focus:border-academy-primary focus:ring-4 focus:ring-academy-primary/10 transition-all placeholder:text-academy-textMain/30"
            />
            <button type="button" onClick={() => setShowPwd(p => !p)}
                    aria-label={showPwd ? t('login.hide_password') : t('login.show_password')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-academy-textMain/40 hover:text-academy-textMain hover:bg-black/5 transition-all">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === 'register' && form.password.length > 0 && (
            <div className="space-y-2 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex justify-between text-xs text-gray-500 font-semibold">
                <span>{t('login.password_strength')}</span>
                <span className={passwordStrength < 40 ? 'text-red-500' : passwordStrength < 80 ? 'text-yellow-600' : 'text-green-600'}>{passwordStrength}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${passwordStrength}%` }}
                  className={`h-full transition-all duration-300 ${passwordStrength < 40 ? 'bg-red-500' : passwordStrength < 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                />
              </div>
              
              <div className="text-[11px] space-y-1 mt-2">
                {[
                  { label: currentLang === 'ar' ? '12 حرف كحد أدنى' : currentLang === 'en' ? 'At least 12 characters' : '12 caractères minimum', met: form.password.length >= 12 },
                  { label: currentLang === 'ar' ? 'حرف كبير واحد على الأقل' : currentLang === 'en' ? 'At least one uppercase letter' : 'Une lettre majuscule', met: /[A-Z]/.test(form.password) },
                  { label: currentLang === 'ar' ? 'حرف صغير واحد على الأقل' : currentLang === 'en' ? 'At least one lowercase letter' : 'Une lettre minuscule', met: /[a-z]/.test(form.password) },
                  { label: currentLang === 'ar' ? 'رقم واحد على الأقل' : currentLang === 'en' ? 'At least one number' : 'Un chiffre', met: /\d/.test(form.password) },
                  { label: currentLang === 'ar' ? 'رمز خاص واحد على الأقل (@$!%*?&)' : currentLang === 'en' ? 'At least one special character (@$!%*?&)' : 'Un caractère spécial (@$!%*?&)', met: /[@$!%*?&]/.test(form.password) }
                ].map((crit, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className={crit.met ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                      {crit.met ? "✓" : "✗"}
                    </span>
                    <span className={crit.met ? "text-green-700 font-medium" : "text-gray-400"}>
                      {crit.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="mt-4 p-3 border border-gray-200 bg-gray-50 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                  {mathCaptcha.num1} + {mathCaptcha.num2} = 
                </span>
                <input
                  type="number"
                  value={mathCaptcha.answer}
                  placeholder="?"
                  onChange={(e) => {
                    const val = e.target.value
                    setMathCaptcha(prev => {
                      const isCorrect = parseInt(val) === prev.num1 + prev.num2
                      return { ...prev, answer: val, result: val === '' ? 'pending' : (isCorrect ? 'success' : 'error') }
                    })
                  }}
                  className={`w-16 bg-white border text-center text-sm rounded-lg px-2 py-1.5 focus:outline-none transition-all ${mathCaptcha.result === 'error' ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-academy-primary'}`}
                />
                {mathCaptcha.result === 'success' && <ShieldCheck className="w-5 h-5 text-green-500" />}
              </div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-right">
                Vérification<br/>Humaine
              </div>
            </div>
          )}

          <button
            type="submit" disabled={loading || (mode === 'register' && (passwordStrength < 100 || mathCaptcha.result !== 'success'))}
            className="w-full btn-primary justify-center py-3.5 text-base shadow-soft disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading
              ? t('login.loading')
              : mode === 'login' ? t('login.sign_in') : t('login.create_account')
            }
          </button>

          <p className="text-center text-academy-textMain/50 text-sm font-medium pt-2">
            {mode === 'login' ? t('login.no_account') + ' ' : t('login.have_account') + ' '}
            <button
              type="button"
              onClick={() => {
                setMode(m => m === 'login' ? 'register' : 'login')
                generateMathCaptcha()
              }}
              className="text-academy-primary font-bold hover:underline"
            >
              {mode === 'login' ? t('login.register') : t('login.sign_in')}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
