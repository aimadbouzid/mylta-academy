// PaymentModal.jsx — Paiement algérien CCP & BaridiMob
import { useState, useRef } from 'react'
import { X, Upload, Smartphone, Check, AlertCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../hooks/useToast.jsx'
import api from '../api/axios'

const PAYMENT_INFO = {
  ccp:    '0022850911 Clé 89',
  nom:    'Bouzidi aimad',
  barid:  '00799999002285091189',
  phone:  '0795103743',
  redotpay: '1275569116'
}

export default function PaymentModal({ course, onClose, onSuccess }) {
  const { t } = useLanguage()
  const { success, error: toastError } = useToast()
  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [notes, setNotes]     = useState('')
  const [payType, setPayType] = useState('CCP')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const fileRef = useRef()

  if (!course) return null

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(f)
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
      form.append('receiptImage', file)

      await api.post('/payments/receipt', form)
      setDone(true)
      success(t('payment.receipt_submitted') + ' ' + t('payment.validation_time'))
      setTimeout(() => { onClose?.(); onSuccess?.() }, 3000)
    } catch (err) {
      toastError(err.response?.data?.error || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  // Checkout Edahabia supprimé car paiement 100% manuel

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
            <span className="text-academy-textMain/70 text-[11px] sm:text-xs font-semibold tracking-wide uppercase">{t('payment.total')}</span>
            {course.discountPrice && course.discountPrice < course.price ? (
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
                    <span className="font-mono text-academy-textMain text-sm font-medium">{PAYMENT_INFO.redotpay}</span>
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
                      <span className="font-mono text-academy-textMain text-sm font-medium">{val}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Type de paiement */}
              <div>
                <label className="text-academy-textMain/60 text-xs mb-2 block">{t('payment.payment_mode')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['CCP', 'BARIDIMOB', 'REDOTPAY'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPayType(p)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all text-center
                                  ${payType === p
                                    ? 'bg-academy-primary/15 border-academy-primary/50 text-academy-primary font-bold'
                                    : 'border-academy-border text-academy-textMain/40 hover:text-academy-textMain/70'
                                  }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload reçu - Affiché pour tous les modes (CCP, BaridiMob, RedotPay) */}
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
                                  transition-all duration-300
                                  ${preview ? 'border-academy-primary/40 bg-academy-primary/5' : 'border-academy-border hover:border-academy-primary/30 hover:bg-academy-primary/5'}`}
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
                    className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed py-3 font-bold"
                  >
                    {loading ? t('payment.sending') : t('payment.submit_receipt')}
                  </button>
              </div>
          )}
        </div>
      </div>
    </div>
  )
}
