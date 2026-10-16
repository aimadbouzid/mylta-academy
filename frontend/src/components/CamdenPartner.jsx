import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook } from 'lucide-react'

// Partenaire officiel (convention signée) : lieu des formations présentielles.
export default function CamdenPartner() {
  return (
    <section className="section-container pt-4">
      <div className="max-w-3xl mx-auto bg-white border border-academy-border rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <img src="/camden-logo.jpg" alt="Camden International Institute" width="96" height="64" loading="lazy"
               className="w-20 sm:w-24 h-14 sm:h-16 object-contain shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-academy-primary">Partenaire officiel · Convention signée</p>
            <p className="font-display font-black text-[15px] sm:text-lg leading-tight">Mylta Academy × Camden International Institute</p>
            <p className="text-xs text-academy-textMain/60 mt-0.5">Nos formations en présentiel ont lieu chez Camden, à Béjaïa.</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-academy-border grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] text-academy-textMain/75">
          <span className="flex gap-1.5"><MapPin size={15} className="text-academy-primary shrink-0 mt-0.5" /> Cité Douanière Bir Slam, Promo Ceram Bt D1 W, Béjaïa</span>
          <a href="tel:0542471261" className="flex gap-1.5 hover:text-academy-primary"><Phone size={15} className="text-academy-primary shrink-0 mt-0.5" /> 0542 47 12 61</a>
          <a href="mailto:info@camden-dz.com" className="flex gap-1.5 hover:text-academy-primary"><Mail size={15} className="text-academy-primary shrink-0 mt-0.5" /> info@camden-dz.com</a>
          <a href="https://www.facebook.com/p/Camden-Institute-61559611526317/" target="_blank" rel="noopener noreferrer" className="flex gap-1.5 hover:text-academy-primary"><Facebook size={15} className="text-academy-primary shrink-0 mt-0.5" /> Camden Institute</a>
        </div>
        <Link to="/coaching-presentiel" className="mt-3 inline-block text-sm font-bold border-b-2 border-academy-textMain hover:text-academy-primary hover:border-academy-primary">
          Voir la formation présentielle
        </Link>
      </div>
    </section>
  )
}
