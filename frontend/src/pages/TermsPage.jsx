import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import { useLanguage } from '../context/LanguageContext'

export default function TermsPage() {
  const { t } = useLanguage()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <SEOHead 
        title="Conditions Générales | Mylta Academy" 
        description="Conditions générales d'utilisation et de vente de Mylta Academy." 
      />
      <Navbar />

      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-academy-surfaceDark rounded-2xl shadow-sm border border-academy-border p-6 md:p-12">
          <h1 className="text-3xl md:text-4xl font-black font-display text-academy-textMain mb-8">
            Conditions Générales d'Utilisation et de Vente
          </h1>
          
          <div className="prose prose-academy max-w-none text-academy-textMain/80">
            <p className="mb-6 font-medium text-sm">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <h2 className="text-xl font-bold text-academy-textMain mt-8 mb-4">1. Acceptation des conditions</h2>
            <p className="mb-4">
              En accédant et en utilisant la plateforme Mylta Academy, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation et de Vente (CGUV). Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
            </p>

            <h2 className="text-xl font-bold text-academy-textMain mt-8 mb-4">2. Accès à la plateforme et Inscription</h2>
            <p className="mb-4">
              Pour accéder aux formations, l'utilisateur doit créer un compte. Les informations fournies doivent être exactes et à jour. Le partage de compte est strictement interdit et peut entraîner la suspension définitive de l'accès.
            </p>

            <h2 className="text-xl font-bold text-academy-textMain mt-8 mb-4">3. Achat et Paiement</h2>
            <p className="mb-4">
              Les prix des formations sont indiqués en Dinars Algériens (DZD). L'accès à une formation est accordé après validation du paiement (par exemple via Edahabia ou CCP). Les transactions sont sécurisées et définitives.
            </p>

            <h2 className="text-xl font-bold text-academy-textMain mt-8 mb-4">4. Propriété Intellectuelle</h2>
            <p className="mb-4">
              L'ensemble du contenu présent sur Mylta Academy (vidéos, textes, documents, codes sources) est la propriété exclusive de Mylta Academy et de ses formateurs. Toute reproduction, distribution ou revente est strictement interdite et passible de poursuites judiciaires.
            </p>

            <h2 className="text-xl font-bold text-academy-textMain mt-8 mb-4">5. Modification des conditions</h2>
            <p className="mb-4">
              Mylta Academy se réserve le droit de modifier ces CGUV à tout moment. Les utilisateurs seront informés des changements majeurs. L'utilisation continue de la plateforme après modification vaut acceptation.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
