import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook } from 'lucide-react'

// Partenaire officiel (convention signée) : lieu des formations présentielles.
// Bloc centré : le logo surmonte le texte et les coordonnées se rangent sous
// l'axe, plutôt qu'alignées à gauche contre le logo.
export default function CamdenPartner() {
  return (
    <section className="section-container pt-4">
      <div className="max-w-3xl mx-auto bg-white border border-academy-border rounded-xl p-5 sm:p-6 text-center">
        <img src="/camden-logo.jpg" alt="Camden International Institute" width="96" height="64" loading="lazy"
             className="mx-auto w-24 sm:w-28 h-16 sm:h-20 object-contain" />
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.15em] text-academy-primary">Partenaire officiel · Convention signée</p>
        <p className="font-display font-black text-[15px] sm:text-lg leading-tight mt-1">Mylta Academy × Camden International Institute</p>
        <p className="text-xs text-academy-textMain/60 mt-1">Nos formations en présentiel ont lieu chez Camden, à Béjaïa.</p>
        <div className="mt-4 pt-4 border-t border-academy-border flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-academy-textMain/75">
          <span className="flex items-center gap-1.5"><MapPin size={15} className="text-academy-primary shrink-0" /> Cité Douanière Bir Slam, Promo Ceram Bt D1 W, Béjaïa</span>
          <a href="tel:0542471261" className="flex items-center gap-1.5 hover:text-academy-primary"><Phone size={15} className="text-academy-primary shrink-0" /> 0542 47 12 61</a>
          <a href="mailto:info@camden-dz.com" className="flex items-center gap-1.5 hover:text-academy-primary"><Mail size={15} className="text-academy-primary shrink-0" /> info@camden-dz.com</a>
          <a href="https://www.facebook.com/p/Camden-Institute-61559611526317/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-academy-primary"><Facebook size={15} className="text-academy-primary shrink-0" /> Camden Institute</a>
        </div>
        <Link to="/coaching-presentiel" className="mt-4 inline-block text-sm font-bold border-b-2 border-academy-textMain hover:text-academy-primary hover:border-academy-primary">
          Voir la formation présentielle
        </Link>
      </div>
    </section>
  )
}
