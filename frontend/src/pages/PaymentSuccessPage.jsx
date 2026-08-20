import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function PaymentSuccessPage() {
  const { t } = useLanguage()
  const { checkAuth } = useAuth()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [refreshed, setRefreshed] = useState(false)

  // Rafraîchir l'état d'authentification pour mettre à jour les cours accessibles
  useEffect(() => {
    const refresh = async () => {
      try {
        await checkAuth()
      } catch (e) {
        // Ignorer les erreurs de refresh
      }
      setRefreshed(true)
    }
    refresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-academy-surface text-academy-textMain flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6 pt-32">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Animated Success Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 
                            flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-academy-textMain mb-2">
              Paiement confirmé !
            </h1>
            <p className="text-academy-textMain/60 text-sm sm:text-base leading-relaxed">
              Votre paiement a été traité avec succès. Votre formation est en cours d'activation.
            </p>
          </div>

          {/* Order ID */}
          {orderId && (
            <div className="bg-academy-surfaceDark border border-academy-border rounded-xl p-4">
              <p className="text-academy-textMain/50 text-xs uppercase tracking-wider font-semibold mb-1">
                Référence de commande
              </p>
              <p className="font-mono text-academy-textMain text-sm font-medium">{orderId}</p>
            </div>
          )}

          {/* Info Note */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-left">
            <div className="flex items-start gap-3">
              <Sparkles className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-academy-textMain/70 leading-relaxed space-y-1">
                <p className="font-semibold text-green-400">Activation automatique</p>
                <p>
                  Votre formation sera débloquée automatiquement dès que le paiement est confirmé par le système.
                  Cela peut prendre quelques secondes.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/my-courses"
              className="flex-1 btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              Mes formations <ArrowRight size={16} />
            </Link>
            <Link
              to="/courses"
              className="flex-1 py-3 text-sm font-bold rounded-xl border border-academy-border
                         text-academy-textMain/70 hover:text-academy-textMain hover:border-academy-primary/50
                         transition-all text-center"
            >
              Voir d'autres formations
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
