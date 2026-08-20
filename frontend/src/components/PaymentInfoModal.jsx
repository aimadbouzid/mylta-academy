import { useState } from 'react'
import { X, CreditCard, Copy, Check, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react'
import { PAYMENT_INFO } from '../config/paymentConfig'
import { useToast } from '../hooks/useToast.jsx'
import { useLanguage } from '../context/LanguageContext'

export default function PaymentInfoModal({ initialMethod = 'BARIDIMOB', onClose, onSelectCourse }) {
  const { t } = useLanguage()
  const { success } = useToast()
  const [activeTab, setActiveTab] = useState(initialMethod.toUpperCase())
  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    success(`${label} copié dans le presse-papier !`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const methods = [
    { id: 'CCP', name: 'CCP Algérie', icon: CreditCard, color: 'text-academy-primary', bg: 'bg-academy-primary/10', border: 'border-academy-primary/30' },
    { id: 'BARIDIMOB', name: 'BaridiMob', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { id: 'REDOTPAY', name: 'RedotPay', icon: CreditCard, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  ]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <div
        className="relative w-full max-w-md bg-academy-surface border border-academy-border rounded-2xl shadow-2xl overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-academy-border bg-academy-surfaceDark/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-academy-primary/10 border border-academy-primary/20 text-academy-primary">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-academy-textMain">
                Modalités de Paiement Local
              </h3>
              <p className="text-xs text-academy-textMain/50">Algérie (CCP, BaridiMob) & RedotPay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-academy-textMain/40 hover:text-academy-textMain hover:bg-academy-surface transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs selector */}
        <div className="p-4 bg-academy-surfaceDark/40 border-b border-academy-border">
          <div className="grid grid-cols-3 gap-2 p-1 bg-academy-surface border border-academy-border rounded-xl">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveTab(m.id)}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === m.id
                    ? `${m.bg} ${m.color} border ${m.border} shadow-sm`
                    : 'text-academy-textMain/50 hover:text-academy-textMain hover:bg-academy-surfaceDark'
                }`}
              >
                <m.icon size={13} className={activeTab === m.id ? m.color : 'text-academy-textMain/40'} />
                <span>{m.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Content */}
        <div className="p-5 space-y-4">
          {/* Details Box */}
          <div className="bg-academy-surfaceDark/80 border border-academy-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-academy-border/60">
              <span className="text-xs font-semibold text-academy-textMain/50 uppercase tracking-wider">
                Méthode sélectionnée
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-academy-primary/10 text-academy-primary border border-academy-primary/20">
                {activeTab}
              </span>
            </div>

            {activeTab === 'REDOTPAY' ? (
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs text-academy-textMain/50">RedotPay ID</p>
                  <p className="font-mono font-bold text-sm text-academy-textMain mt-0.5">{PAYMENT_INFO.redotpay}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(PAYMENT_INFO.redotpay, 'RedotPay ID')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-academy-surface border border-academy-border hover:border-academy-primary/40 text-xs font-semibold text-academy-textMain hover:text-academy-primary transition-all active:scale-95"
                >
                  {copiedField === 'RedotPay ID' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  <span>{copiedField === 'RedotPay ID' ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between py-1 border-b border-academy-border/40">
                  <div>
                    <p className="text-xs text-academy-textMain/50">RIP {activeTab === 'BARIDIMOB' ? 'BaridiMob' : 'CCP'}</p>
                    <p className="font-mono font-bold text-xs sm:text-sm text-academy-textMain mt-0.5 select-all">
                      {activeTab === 'BARIDIMOB' ? PAYMENT_INFO.barid : PAYMENT_INFO.ccp}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        activeTab === 'BARIDIMOB' ? PAYMENT_INFO.barid : PAYMENT_INFO.ccp,
                        `RIP ${activeTab}`
                      )
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-academy-surface border border-academy-border hover:border-academy-primary/40 text-xs font-semibold text-academy-textMain hover:text-academy-primary transition-all active:scale-95"
                  >
                    {copiedField === `RIP ${activeTab}` ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    <span>{copiedField === `RIP ${activeTab}` ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-academy-border/40">
                  <div>
                    <p className="text-xs text-academy-textMain/50">Nom du titulaire du compte</p>
                    <p className="font-medium text-xs sm:text-sm text-academy-textMain mt-0.5">{PAYMENT_INFO.nom}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(PAYMENT_INFO.nom, 'Nom du compte')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-academy-surface border border-academy-border hover:border-academy-primary/40 text-xs text-academy-textMain/70 hover:text-academy-textMain transition-all"
                  >
                    {copiedField === 'Nom du compte' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  </button>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs text-academy-textMain/50">Numéro de téléphone lié</p>
                    <p className="font-medium text-xs sm:text-sm text-academy-textMain mt-0.5">{PAYMENT_INFO.phone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(PAYMENT_INFO.phone, 'Téléphone')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-academy-surface border border-academy-border hover:border-academy-primary/40 text-xs text-academy-textMain/70 hover:text-academy-textMain transition-all"
                  >
                    {copiedField === 'Téléphone' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Instructions Step-by-Step */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-academy-textMain/70 uppercase tracking-wider">Comment payer en 3 étapes :</h4>
            <ol className="space-y-2 text-xs text-academy-textMain/80">
              <li className="flex items-start gap-2 bg-academy-surface border border-academy-border/50 p-2.5 rounded-lg">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-academy-primary/20 text-academy-primary font-bold text-[11px] flex items-center justify-center">1</span>
                <span>Copiez les coordonnées de virement ci-dessus.</span>
              </li>
              <li className="flex items-start gap-2 bg-academy-surface border border-academy-border/50 p-2.5 rounded-lg">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-academy-primary/20 text-academy-primary font-bold text-[11px] flex items-center justify-center">2</span>
                <span>Effectuez le virement du montant de la formation via l'application ({activeTab}) ou au guichet CCP.</span>
              </li>
              <li className="flex items-start gap-2 bg-academy-surface border border-academy-border/50 p-2.5 rounded-lg">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-academy-primary/20 text-academy-primary font-bold text-[11px] flex items-center justify-center">3</span>
                <span>Sélectionnez votre cours, cliquez sur <strong>"S'inscrire"</strong> et importez la capture de votre reçu pour débloquer votre accès.</span>
              </li>
            </ol>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
            <ShieldCheck size={16} className="flex-shrink-0" />
            <span>Validation automatique / manuelle rapide sous 24h ouvrables.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-academy-border bg-academy-surfaceDark/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-academy-border text-xs font-semibold text-academy-textMain/70 hover:text-academy-textMain hover:bg-academy-surface transition-all"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              if (onSelectCourse) {
                onSelectCourse()
              } else {
                const el = document.getElementById('formations')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="flex-1 btn-primary py-2 px-4 justify-center text-xs font-bold gap-1.5 shadow-md hover:shadow-lg"
          >
            <span>Découvrir les formations</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
