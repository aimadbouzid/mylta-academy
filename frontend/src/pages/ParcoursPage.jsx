// La page du parcours : la carte en bande dessinée, et rien d'autre.
//
// Elle vit à part de la page d'inscription : on l'envoie telle quelle à
// quelqu'un qui hésite, sans lui faire traverser un formulaire. Et la police
// de lettrage ne se charge que pour qui ouvre cette page.

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import ParcoursAnime from '../components/ParcoursAnime'

export default function ParcoursPage() {
  return (
    <>
      <SEOHead
        title="Le parcours en BD | Mylta Academy"
        description="De toi aujourd'hui à toi dimanche soir : les trois jours de la formation IA & montage vidéo, en quatre cases."
        canonicalPath="/parcours"
      />

      <div className="min-h-screen bg-transparent text-academy-textMain flex flex-col">
        <Navbar />

        <main className="flex-1 px-4 pt-28 pb-24 sm:pt-36 sm:pb-16">
          <div className="mx-auto max-w-3xl">
            <ParcoursAnime />

            <div className="mt-7 text-center">
              <Link to="/coaching-presentiel"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-academy-primary
                               px-6 py-4 text-lg font-bold text-academy-onPrimary shadow-lg shadow-black/15
                               transition-opacity hover:opacity-90">
                Je veux faire ce parcours <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
