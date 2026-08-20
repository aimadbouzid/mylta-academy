import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import { useLanguage } from '../context/LanguageContext'

export default function PrivacyPage() {
  const { t } = useLanguage()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <SEOHead 
        title="Politique de Confidentialité | Mylta Academy" 
        description="Politique de confidentialité et gestion des données personnelles de Mylta Academy." 
      />
      <Navbar />

      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-academy-surfaceDark rounded-2xl shadow-sm border border-academy-border p-6 md:p-12">
          <h1 className="text-3xl md:text-4xl font-black font-display text-academy-textMain mb-8">
            Politique de Confidentialité
          </h1>
          
          <div className="prose prose-academy max-w-none text-academy-textMain/80">
            <p className="mb-6 font-medium text-sm">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <h2 className="text-xl font-bold text-academy-textMain mt-8 mb-4">1. Collecte des données</h2>
            <p className="mb-4">
              Lors de votre inscription et de l'utilisation de Mylta Academy, nous collectons certaines données personnelles nécessaires au bon fonctionnement du service : nom, adresse email, informations de profil, et historique de progression dans les cours.
            </p>

            <h2 className="text-xl font-bold text-academy-textMain mt-8 mb-4">2. Utilisation de vos données</h2>
            <p className="mb-4">
              Vos données sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Gérer votre compte et vos accès aux formations.</li>
              <li>Vous envoyer des notifications importantes concernant vos achats ou mises à jour de contenu.</li>
              <li>Améliorer l'expérience utilisateur et personnaliser nos recommandations.</li>
              <li>Assurer la sécurité de la plateforme contre la fraude et le piratage.</li>
            </ul>

            <h2 className="text-xl font-bold text-academy-textMain mt-8 mb-4">3. Protection et Sécurité</h2>
            <p className="mb-4">
              La sécurité de vos données est notre priorité. Nous mettons en œuvre des mesures de sécurité techniques (chiffrement des mots de passe, protection CSRF/XSS, connexions sécurisées HTTPS) pour protéger vos informations contre tout accès non autorisé.
            </p>

            <h2 className="text-xl font-bold text-academy-textMain mt-8 mb-4">4. Partage des données</h2>
            <p className="mb-4">
              Mylta Academy ne vend, ne loue, ni ne cède vos données personnelles à des tiers à des fins commerciales. Vos données peuvent être partagées uniquement avec nos partenaires techniques (ex: prestataires de paiement) dans la limite stricte de ce qui est nécessaire à l'exécution du service.
            </p>

            <h2 className="text-xl font-bold text-academy-textMain mt-8 mb-4">5. Vos droits</h2>
            <p className="mb-4">
              Vous avez le droit de consulter, modifier ou demander la suppression de vos données personnelles à tout moment. Vous pouvez exercer ces droits directement depuis les paramètres de votre compte ou en nous contactant via WhatsApp : <a href="https://wa.me/213795103743" target="_blank" rel="noopener noreferrer" className="text-academy-primary font-bold">Cliquez ici pour nous contacter</a>.
            </p>

            <h2 className="text-xl font-bold text-academy-textMain mt-8 mb-4">6. Cookies</h2>
            <p className="mb-4">
              Nous utilisons des cookies essentiels pour maintenir votre session active (authentification) et mémoriser vos préférences (ex: choix de la langue). En utilisant Mylta Academy, vous acceptez l'utilisation de ces cookies techniques indispensables.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
