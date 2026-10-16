import { useEffect } from 'react'
import { X, Check, Lock, MessageCircle } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { formatPrice, discountOf } from './UpcomingCourseCard'

// Fiche d'une formation à venir : contenu détaillé + être prévenu sur WhatsApp.
export default function UpcomingCourseModal({ course, onClose }) {
  const { settings } = useSiteSettings()
  const whatsappNumber = settings?.coaching?.whatsappNumber

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow }
  }, [onClose])

  if (!course) return null
  const discount = discountOf(course)
  const notifyUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour Mylta Academy, je souhaite être prévenu(e) dès que la formation « ${course.title} » sera disponible.`)}`
    : null
  const chips = [course.category, course.level, course.duration].filter(Boolean)

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={course.title}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl">
        <div className="relative h-28 bg-gradient-to-br from-[#2a0a0a] via-[#5c0d0d] to-[#8b0000] flex items-center justify-center">
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-white text-[#8b0000]">Bientôt</span>
          <button type="button" onClick={onClose} aria-label="Fermer"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25">
            <X size={18} />
          </button>
          <span className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white"><Lock size={20} /></span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div>
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {chips.map(c => <span key={c} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-academy-surface text-academy-textMain/70">{c}</span>)}
              </div>
            )}
            <h2 className="font-display font-black text-xl sm:text-2xl leading-tight">{course.title}</h2>
            {course.description && <p className="mt-2 text-academy-textMain/70 leading-relaxed">{course.description}</p>}
          </div>

          {Number(course.price) > 0 && (
            <div className="rounded-xl border-2 border-academy-primary/30 bg-academy-primary/5 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-academy-primary mb-1">Prix de lancement</p>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-2xl font-black">{formatPrice(course.price)}</span>
                {Number(course.oldPrice) > Number(course.price) && <span className="text-sm text-academy-textMain/45 line-through">{formatPrice(course.oldPrice)}</span>}
                {discount > 0 && <span className="text-xs font-black text-white bg-emerald-600 rounded-full px-2 py-0.5">-{discount}%</span>}
              </div>
            </div>
          )}

          {(course.program || []).length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3">Au programme</h3>
              <ol className="space-y-2">
                {course.program.map((p, i) => (
                  <li key={i} className="flex items-baseline gap-2.5 border-b border-academy-border pb-2">
                    <span className="text-xs font-black text-academy-primary tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[14px] font-semibold leading-snug">{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {(course.included || []).length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-2">Inclus</h3>
              <ul className="space-y-1.5">
                {course.included.map((x, i) => (
                  <li key={i} className="flex gap-2 text-[14px]"><Check size={17} className="text-emerald-600 shrink-0 mt-0.5" /> {x}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button type="button" disabled className="w-full py-3.5 rounded-xl bg-academy-surface text-academy-textMain/50 font-bold cursor-not-allowed">
              Bientôt disponible
            </button>
            {notifyUrl && (
              <a href={notifyUrl} target="_blank" rel="noopener noreferrer"
                 className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-3.5 rounded-xl transition-colors">
                <MessageCircle size={18} /> Me prévenir sur WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
