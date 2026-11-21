import { useSiteSettings } from '../context/SiteSettingsContext'
import { PAPIER, ENCRE, ROUGE, fondPapier, TITRE, MONO } from '../lib/papier'

// Petite photo encadrée, à côté du titre d'accueil.
//
// Elle remplace le diaporama animé qui occupait tout le haut de page : six
// scènes, des minuteries, une carte en SVG et un grain animé, pour redire ce
// que le billet et la page présentiel disent déjà. Ici, une seule image, rien
// qui bouge, rien qui tourne en fond — et le même papier que le billet, pour
// que l'accueil parle d'une seule voix.

export default function PresentationReel() {
  const { settings } = useSiteSettings()
  const cfg = settings?.inPerson || {}

  return (
    <figure className="w-[210px] sm:w-[240px] mx-auto lg:mr-0 rotate-[-1.5deg]"
            style={{ ...fondPapier, padding: '10px 10px 0', borderRadius: 3, boxShadow: '0 14px 34px -14px rgba(0,0,0,.45)' }}>
      <img
        src="/galerie/photo-03.jpg"
        alt="Formation en petit groupe à Béjaïa"
        width="480" height="600" loading="eager" decoding="async"
        className="block w-full aspect-[4/5] object-cover"
        style={{ filter: 'grayscale(0.15) contrast(1.05)' }}
      />

      <figcaption className="py-2.5 text-center">
        <span className="block text-[8.5px] uppercase tracking-[0.22em]" style={{ ...MONO, color: ROUGE }}>
          Béjaïa · en présentiel
        </span>
        <span className="block mt-1 text-[12.5px] uppercase leading-tight" style={{ ...TITRE, color: ENCRE }}>
          {cfg.program?.length ? '3 jours, au smartphone' : 'Formation au smartphone'}
        </span>
      </figcaption>

      <span aria-hidden="true" className="sr-only" style={{ color: PAPIER }} />
    </figure>
  )
}
