import { useSearchParams, Link } from 'react-router-dom'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'

export default function PaymentFailurePage() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-academy-surface text-academy-textMain flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6 pt-32">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Error Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-red-500/10 rounded-full animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 
                            flex items-center justify-center shadow-lg shadow-red-500/20">
              <XCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-academy-textMain mb-2">
              Paiement échoué
            </h1>
            <p className="text-academy-textMain/60 text-sm sm:text-base leading-relaxed">
              Votre paiement n'a pas pu être traité. Aucun montant n'a été débité.
              Vous pouvez réessayer ou choisir un autre mode de paiement.
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

          {/* Help Note */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-left">
            <div className="text-xs text-academy-textMain/70 leading-relaxed space-y-2">
              <p className="font-semibold text-red-400">Causes possibles :</p>
              <ul className="list-disc list-inside space-y-1 text-academy-textMain/50">
                <li>Solde insuffisant sur votre carte</li>
                <li>Paiement annulé par l'utilisateur</li>
                <li>Carte non activée pour le paiement en ligne</li>
                <li>Problème technique temporaire</li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/courses"
              className="flex-1 btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Réessayer
            </Link>
            <Link
              to="/"
              className="flex-1 py-3 text-sm font-bold rounded-xl border border-academy-border
                         text-academy-textMain/70 hover:text-academy-textMain hover:border-academy-primary/50
                         transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
