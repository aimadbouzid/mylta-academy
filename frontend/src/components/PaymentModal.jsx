import { useState, useRef } from 'react'
import { X, Upload, Smartphone, Check, AlertCircle, Copy, CreditCard, Loader2, ShieldCheck, Wallet, Clock } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../hooks/useToast.jsx'
import api from '../api/axios'
import { PAYMENT_INFO } from '../config/paymentConfig'
import { optimizeImage } from '../utils/imageOptimizer'
import { trackEvent } from '../lib/facebookPixel'

export default function PaymentModal({ course, onClose, onSuccess, initialPayType = 'CCP' }) {
  const { t } = useLanguage()
  const { success, error: toastError } = useToast()
  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [notes, setNotes]     = useState('')
  const [payType, setPayType] = useState(initialPayType)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [copiedLabel, setCopiedLabel] = useState(null)
  const [chargilyLoading, setChargilyLoading] = useState(false)
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponData, setCouponData] = useState(null) // { valid: true, discountPercent: 20, newPrice: 1500 }
  const [couponError, setCouponError] = useState(null)

  const fileRef = useRef()

  // Montant réellement dû, dans l'ordre de priorité affiché à l'écran :
  // coupon appliqué > promotion en cours > prix plein. Sert au suivi de
  // conversion, pour que la valeur remontée corresponde à ce que paie le client.
  const finalPrice = couponData?.valid
    ? couponData.newPrice
    : (course.discountPrice && course.discountPrice < course.price
        ? course.discountPrice
        : course.price) || 0

  const copyText = (val, label) => {
    navigator.clipboard.writeText(val)
    setCopiedLabel(label)
    success(`${label} copié dans le presse-papier !`)
    setTimeout(() => setCopiedLabel(null), 2000)
  }

  if (!course) return null

  const handleFile = async (f) => {
    if (!f) return

    // Preview original immediately
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(f)

    setFile(f)

    if (f.type.startsWith('image/')) {
      try {
        const optimized = await optimizeImage(f)
        setFile(optimized)
      } catch (err) {
        console.error('Image optimization failed, using original file:', err)
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmitCCP = async () => {
    if (!file) return toastError(t('payment.attach_receipt'))
    setLoading(true)
    try {
      const form = new FormData()
      form.append('courseId', course.id)
      form.append('paymentType', payType)
      form.append('notes', notes)
      if (couponData?.valid) {
        form.append('couponCode', couponCode)
      }
      form.append('receiptImage', file)

      await api.post('/payments/receipt', form)
      setDone(true)

      // Conversion Meta. Le reçu part en validation manuelle : on émet donc
      // InitiateCheckout (intention d'achat confirmée) et non Purchase, qui
      // signalerait une vente encaissée alors que l'admin peut encore refuser.
      trackEvent('InitiateCheckout', {
        content_ids: [String(course.id)],
        content_name: course.title,
        content_type: 'product',
        value: finalPrice,
        currency: 'DZD',
      })

      success(t('payment.receipt_submitted') + ' ' + t('payment.validation_time'))
      setTimeout(() => { onClose?.(); onSuccess?.() }, 3000)
    } catch (err) {
      toastError(err.response?.data?.error || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleValidateCoupon = async (e) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError(null)
    try {
      const { data } = await api.post('/payments/coupon/validate', { code: couponCode, courseId: course.id })
      setCouponData(data)
      success(`Code appliqué ! -${data.discountPercent}% de réduction.`)
    } catch (err) {
      setCouponData(null)
      setCouponError(err.response?.data?.error || 'Code invalide')
    } finally {
      setCouponLoading(false)
    }
  }

  // ── Checkout Chargily Pay ──
  const handleChargilyCheckout = async () => {
    setChargilyLoading(true)
    try {
      const payload = { courseId: course.id }
      if (couponData?.valid) payload.couponCode = couponCode
      const { data } = await api.post('/payments/chargily/checkout', payload)
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toastError('Erreur : URL de paiement introuvable.')
      }
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur lors de la création du paiement.')
    } finally {
      setChargilyLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)]"
         onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      <div className="relative w-full max-w-md max-h-[90vh] bg-academy-surface border border-academy-border
                      rounded-2xl shadow-soft-lg animate-fade-up overflow-y-auto"
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-academy-border sticky top-0 bg-academy-surface/90 backdrop-blur-md z-20">
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-academy-textMain">{t('payment.title')}</h2>
            <p className="text-academy-textMain/50 text-[11px] sm:text-xs mt-0.5 line-clamp-1">{course.title}</p>
          </div>
          <button onClick={onClose} className="text-academy-textMain/30 hover:text-academy-textMain transition-colors p-1 bg-academy-surface rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Prix */}
        <div className="px-4 py-3 bg-gradient-to-r from-academy-primary/10 to-academy-surfaceDark border-b border-academy-border relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-academy-primary/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-academy-textMain/70 text-[11px] sm:text-xs font-semibold tracking-wide uppercase">
              {couponData?.valid ? 'NOUVEAU TOTAL' : t('payment.total')}
            </span>
            {couponData?.valid ? (
              <div className="flex items-center gap-2">
                <span className="text-academy-textMain/40 text-[10px] line-through font-sans decoration-academy-primary/60">
                  {couponData.originalPrice.toLocaleString('fr-DZ')} DA
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-black text-xl sm:text-2xl text-green-400 tracking-tight">
                    {couponData.newPrice.toLocaleString('fr-DZ')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-green-500 ml-0.5">DA</span>
                </div>
              </div>
            ) : course.discountPrice && course.discountPrice < course.price ? (
              <div className="flex items-center gap-2">
                <span className="text-academy-textMain/40 text-[10px] line-through font-sans decoration-academy-primary/60">
                  {course.price.toLocaleString('fr-DZ')} DA
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-black text-xl sm:text-2xl text-academy-textMain tracking-tight">
                    {course.discountPrice.toLocaleString('fr-DZ')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-academy-primary ml-0.5">DA</span>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-xl sm:text-2xl text-academy-textMain tracking-tight">
                  {(course.price || 0).toLocaleString('fr-DZ')}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-academy-primary ml-0.5">DA</span>
              </div>
            )}
          </div>
        </div>

        {/* En-tête Mode Virement */}
        <div className="px-6 py-3.5 bg-academy-surfaceDark border-b border-academy-border flex items-center gap-2 text-academy-primary text-sm font-semibold">
          <Smartphone size={16} />
          <span>{t('payment.manual_payment')}</span>
        </div>

        <div className="p-4 sm:p-5">
          {done ? (
            /* ── État succès ── */
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-900/30 border border-green-500/40
                              flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <p className="font-display font-semibold text-academy-textMain text-base">{t('payment.receipt_submitted')}</p>
              <p className="text-academy-textMain/50 text-xs mt-1">{t('payment.validation_time')}</p>
            </div>
          ) : (
            /* ── Onglet CCP / BaridiMob ── */
            <div className="space-y-4">
              {/* Infos de paiement */}
              <div className="bg-academy-surfaceDark border border-academy-border rounded-xl p-4 space-y-2.5">
                <p className="text-academy-primary text-xs font-semibold uppercase tracking-wider mb-3">
                  {t('payment.transfer_info')}
                </p>
                {payType === 'REDOTPAY' ? (
                  <div className="flex items-center justify-between">
                    <span className="text-academy-textMain/50 text-sm">RedotPay ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-academy-textMain text-sm">{PAYMENT_INFO.redotpay}</span>
                      <button
                        type="button"
                        onClick={() => copyText(PAYMENT_INFO.redotpay, 'RedotPay ID')}
                        className="p-1.5 rounded-md hover:bg-academy-surface text-academy-textMain/60 hover:text-academy-primary transition-colors"
                        title="Copier ID"
                      >
                        {copiedLabel === 'RedotPay ID' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  [
                    [t('payment.rip_ccp'), PAYMENT_INFO.ccp],
                    [t('payment.account_name'), PAYMENT_INFO.nom],
                    ['BaridiMob', PAYMENT_INFO.barid],
                    ['Numéro', PAYMENT_INFO.phone],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between mb-1.5 last:mb-0">
                      <span className="text-academy-textMain/50 text-sm">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-academy-textMain text-sm">{val}</span>
                        <button
                          type="button"
                          onClick={() => copyText(val, label)}
                          className="p-1 rounded-md hover:bg-academy-surface text-academy-textMain/60 hover:text-academy-primary transition-colors"
                          title={`Copier ${label}`}
                        >
                          {copiedLabel === label ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Type de paiement */}
              <div>
                <label className="text-academy-textMain/70 text-xs font-semibold uppercase tracking-wider mb-3 block">
                  {t('payment.payment_mode')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['CCP', 'BARIDIMOB', 'REDOTPAY', 'CHARGILY'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPayType(p)}
                      className={`p-3 rounded-xl text-left border transition-all flex items-start gap-3
                                  ${payType === p
                                    ? p === 'CHARGILY'
                                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-sm shadow-emerald-500/20'
                                      : 'bg-academy-primary/10 border-academy-primary text-academy-primary shadow-sm shadow-academy-primary/20'
                                    : 'border-academy-border bg-academy-surfaceDark hover:border-academy-textMain/30 text-academy-textMain/70 hover:text-academy-textMain'
                                  }`}
                    >
                      <div className={`p-2 rounded-lg ${payType === p ? (p === 'CHARGILY' ? 'bg-emerald-500/20' : 'bg-academy-primary/20') : 'bg-academy-surface border border-academy-border'}`}>
                        {p === 'CHARGILY' ? <ShieldCheck size={18} className={payType === p ? 'text-emerald-500' : 'text-academy-textMain/50'} /> : p === 'REDOTPAY' ? <CreditCard size={18} className={payType === p ? 'text-academy-primary' : 'text-academy-textMain/50'} /> : <Smartphone size={18} className={payType === p ? 'text-academy-primary' : 'text-academy-textMain/50'} />}
                      </div>
                      <div className="flex flex-col flex-1 mt-0.5">
                        <span className="font-bold text-sm leading-tight">
                          {p === 'CHARGILY' ? 'CIB / Edahabia' : p === 'BARIDIMOB' ? 'BaridiMob' : p === 'REDOTPAY' ? 'RedotPay' : 'CCP (Poste)'}
                        </span>
                        <span className={`text-[10px] sm:text-xs mt-1 leading-tight ${payType === p ? 'opacity-90' : 'opacity-60'}`}>
                          {p === 'CHARGILY' ? 'Paiement sécurisé Chargily' : p === 'REDOTPAY' ? 'Carte Visa — transfert par ID' : 'Virement manuel'}
                        </span>
                      </div>
                    </button>
                  ))}

                  {/* Stripe & PayPal — intégration prête côté backend, en attente
                      d'ouverture des comptes. Couleur de marque + badge "Bientôt"
                      pour rester visibles sans prendre la place d'une vraie option. */}
                  {[
                    { id: 'STRIPE', name: 'Stripe', Icon: CreditCard, ring: 'border-indigo-500/30 bg-indigo-500/10', chip: 'bg-indigo-500/20', text: 'text-indigo-300' },
                    { id: 'PAYPAL', name: 'PayPal', Icon: Wallet, ring: 'border-sky-500/30 bg-sky-500/10', chip: 'bg-sky-500/20', text: 'text-sky-300' },
                  ].map(({ id, name, Icon, ring, chip, text }) => (
                    <button
                      key={id}
                      type="button"
                      aria-disabled="true"
                      onClick={() => toastError('Bientôt disponible : ouverture du compte en cours.')}
                      title="Bientôt disponible"
                      className={`p-3 rounded-xl text-left border cursor-not-allowed flex items-center gap-3 ${ring}`}
                    >
                      <div className={`p-2 rounded-lg ${chip}`}>
                        <Icon size={18} className={text} />
                      </div>
                      <span className={`font-bold text-sm flex-1 ${text}`}>{name}</span>
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide
                                        text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5 flex-shrink-0">
                        <Clock size={10} /> Bientôt
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Promo (affiché pour tous les modes) */}
                  <div className="space-y-1">
                    <label className="text-academy-textMain/70 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
                      Avez-vous un code promo ?
                    </label>
                    <form onSubmit={handleValidateCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="Ex: LANCEMENT50"
                        className="input-academy text-xs py-2 flex-1 uppercase"
                        disabled={couponData?.valid}
                      />
                      <button
                        type="submit"
                        disabled={!couponCode || couponLoading || couponData?.valid}
                        className="bg-academy-surfaceDark border border-academy-border text-academy-textMain text-xs font-bold px-4 rounded-lg hover:border-academy-primary/50 transition-all disabled:opacity-50"
                      >
                        {couponLoading ? '...' : couponData?.valid ? 'Appliqué' : 'Valider'}
                      </button>
                    </form>
                    {couponError && <p className="text-red-400 text-xs mt-1">{couponError}</p>}
                  </div>

              {payType === 'CHARGILY' ? (
                /* ── Mode Chargily Pay (paiement en ligne) ── */
                <>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 space-y-4 relative overflow-hidden mt-2">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-3 text-emerald-500 text-base font-bold relative z-10">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <ShieldCheck size={20} />
                      </div>
                      <span>Paiement 100% Sécurisé via Chargily Pay</span>
                    </div>
                    <p className="text-academy-textMain/80 text-sm leading-relaxed relative z-10">
                      Réglez votre inscription en toute sécurité avec votre carte <strong className="text-white">Edahabia</strong> ou <strong className="text-white">CIB</strong>. La transaction est chiffrée de bout en bout et protégée par notre partenaire certifié <span className="font-bold text-emerald-400">Chargily</span>.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-academy-textMain/70 relative z-10 bg-black/30 p-3 rounded-lg border border-emerald-500/20">
                      <Check size={18} className="text-emerald-500 flex-shrink-0" />
                      <span><strong className="text-white">Accès immédiat</strong> à la formation juste après le paiement.</span>
                    </div>
                  </div>

                  <button
                    onClick={handleChargilyCheckout}
                    disabled={chargilyLoading}
                    className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-bold rounded-xl
                               bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500
                               text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30
                               transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2 mt-2"
                  >
                    {chargilyLoading ? (
                      <><Loader2 size={18} className="animate-spin" /> Sécurisation en cours...</>
                    ) : (
                      <><ShieldCheck size={18} /> Payer par CIB / Edahabia</>
                    )}
                  </button>
                </>
              ) : (
                /* ── Mode manuel (CCP / BaridiMob / RedotPay) ── */
                <>
                  {/* Upload reçu */}
                  <div>
                    <label className="text-academy-textMain/60 text-xs mb-2 block">
                      {t('payment.receipt_label')} <span className="text-red-400">*</span>
                    </label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={e => e.preventDefault()}
                      onClick={() => fileRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                                  transition-all duration-300 ${preview ? 'border-academy-primary/40 bg-academy-primary/5' : 'border-academy-border hover:border-academy-primary/30 hover:bg-academy-primary/5'}`}
                    >
                      {preview ? (
                        <div className="space-y-2">
                          <img src={preview} alt="Reçu" className="max-h-32 mx-auto rounded-lg object-contain" />
                          <p className="text-academy-primary text-xs">{file?.name}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-academy-textMain/30 mx-auto" />
                          <p className="text-academy-textMain/50 text-sm">
                            {t('payment.drop_receipt')} <span className="text-academy-primary underline">{t('payment.browse')}</span>
                          </p>
                          <p className="text-academy-textMain/25 text-xs">{t('payment.file_formats')}</p>
                        </div>
                      )}
                      <input ref={fileRef} type="file" accept="image/*" className="hidden"
                             onChange={e => handleFile(e.target.files[0])} />
                    </div>
                  </div>

                  {/* Notes */}
                  <textarea
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder={t('payment.notes_placeholder')}
                    rows={2}
                    className="input-academy text-sm resize-none"
                  />

                  <div className="flex items-start gap-2 text-xs text-academy-textMain/40">
                    <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                    {t('payment.verification_note')}
                  </div>

                  <button
                    onClick={handleSubmitCCP}
                    disabled={loading || !file}
                    className="w-full btn-primary py-3 sm:py-3.5 text-sm sm:text-base disabled:opacity-50 mt-2"
                  >
                    {loading ? t('common.loading') : t('payment.submit_receipt')}
                  </button>
                </>
              )}
              </div>
          )}
        </div>
      </div>
    </div>
  )
}
